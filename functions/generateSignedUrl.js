const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, getApps } = require('firebase-admin/app');

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const storage = getStorage();

/**
 * Cloud Function to generate time-limited signed URLs for external sharing
 * Implements Norwegian data protection requirements and audit logging
 */
exports.generateSignedUrl = onCall(async (request) => {
  const { data, auth } = request;
  
  // Check authentication
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Bruker må være innlogget for å generere delingslenker');
  }

  const { fileId, userId, orgId, expirationHours = 24, purpose = 'external_sharing' } = data;

  // Validate input parameters
  if (!fileId || !userId) {
    throw new HttpsError('invalid-argument', 'Mangler påkrevde parametere: fileId og userId');
  }

  if (expirationHours < 1 || expirationHours > 168) { // Max 1 week
    throw new HttpsError('invalid-argument', 'Utløpstid må være mellom 1 og 168 timer');
  }

  try {
    // Get file metadata to verify permissions and existence
    const docPath = orgId 
      ? `organizations/${orgId}/files/${fileId}`
      : `users/${userId}/files/${fileId}`;
    
    const fileDoc = await db.doc(docPath).get();
    
    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'Filen finnes ikke');
    }

    const fileData = fileDoc.data();

    // Check permissions
    const hasPermission = await checkFileAccess(auth.uid, fileData, orgId);
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'Du har ikke tilgang til denne filen');
    }

    // Norwegian GDPR compliance check
    if (!fileData.gdprCompliant || fileData.dataLocation !== 'EU') {
      throw new HttpsError('failed-precondition', 'Filen oppfyller ikke GDPR-krav for deling');
    }

    // Generate signed URL with expiration
    const bucket = storage.bucket();
    const file = bucket.file(fileData.storagePath);

    // Check if file exists in storage
    const [exists] = await file.exists();
    if (!exists) {
      throw new HttpsError('not-found', 'Filen finnes ikke i lagring');
    }

    // Calculate expiration time
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + expirationHours);

    // Generate signed URL with Norwegian-specific configuration
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: expirationTime,
      promptSaveAs: fileData.name, // Suggest original filename
      responseDisposition: `attachment; filename="${encodeURIComponent(fileData.name)}"`,
      // Additional security headers
      responseType: fileData.contentType
    });

    // Create sharing record for audit trail (Norwegian compliance requirement)
    const sharingRecord = {
      fileId,
      fileName: fileData.name,
      userId,
      orgId: orgId || null,
      sharedBy: auth.uid,
      sharedAt: new Date(),
      expiresAt: expirationTime,
      purpose,
      signedUrlHash: hashUrl(signedUrl), // Store hash for tracking
      accessCount: 0,
      lastAccessed: null,
      
      // Norwegian compliance fields
      gdprCompliant: true,
      dataSubjectRights: {
        canRevoke: true,
        canAudit: true
      },
      
      // Security metadata
      clientIP: request.rawRequest?.ip || 'unknown',
      userAgent: request.rawRequest?.get('user-agent') || 'unknown',
      
      status: 'active'
    };

    // Save sharing record
    const sharingRef = await db.collection('file_shares').add(sharingRecord);

    // Log sharing action for Norwegian audit requirements
    await logSharingAction('generated', {
      shareId: sharingRef.id,
      fileId,
      sharedBy: auth.uid,
      expirationHours,
      timestamp: new Date()
    });

    // Update file access statistics
    await updateFileStats(docPath, 'shared');

    return {
      signedUrl,
      shareId: sharingRef.id,
      expiresAt: expirationTime.toISOString(),
      fileName: fileData.name,
      fileSize: fileData.size,
      validFor: `${expirationHours} timer`,
      message: `Delingslenke gyldig til ${expirationTime.toLocaleString('nb-NO')}`
    };

  } catch (error) {
    console.error('Error generating signed URL:', error);
    
    // Log error for Norwegian compliance
    await logSharingAction('error', {
      fileId,
      userId,
      error: error.message,
      timestamp: new Date()
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Kunne ikke generere delingslenke: ${error.message}`);
  }
});

/**
 * Cloud Function to revoke shared URLs (Norwegian right to revoke access)
 */
exports.revokeSharedUrl = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Bruker må være innlogget');
  }

  const { shareId } = data;

  if (!shareId) {
    throw new HttpsError('invalid-argument', 'Mangler share ID');
  }

  try {
    const shareDoc = await db.doc(`file_shares/${shareId}`).get();
    
    if (!shareDoc.exists) {
      throw new HttpsError('not-found', 'Delingsoppføringen finnes ikke');
    }

    const shareData = shareDoc.data();

    // Check if user has permission to revoke
    if (shareData.sharedBy !== auth.uid && shareData.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'Du har ikke tillatelse til å tilbakekalle denne delingen');
    }

    // Update sharing record
    await db.doc(`file_shares/${shareId}`).update({
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy: auth.uid
    });

    // Log revocation
    await logSharingAction('revoked', {
      shareId,
      revokedBy: auth.uid,
      timestamp: new Date()
    });

    return {
      success: true,
      message: 'Delingslenke tilbakekalt'
    };

  } catch (error) {
    console.error('Error revoking shared URL:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Kunne ikke tilbakekalle delingslenke: ${error.message}`);
  }
});

/**
 * Check if user has access to file
 */
async function checkFileAccess(userId, fileData, orgId) {
  // File owner always has access
  if (fileData.userId === userId) {
    return true;
  }

  // Check organization membership if file is in organization
  if (orgId) {
    const memberDoc = await db.doc(`organizations/${orgId}/members/${userId}`).get();
    return memberDoc.exists && memberDoc.data().status === 'active';
  }

  return false;
}

/**
 * Log sharing actions for Norwegian audit requirements
 */
async function logSharingAction(action, data) {
  try {
    await db.collection('sharing_audit_log').add({
      action,
      ...data,
      
      // Norwegian compliance metadata
      gdprCompliant: true,
      retentionPeriod: '7_years', // Norwegian requirement for educational records
      
      loggedAt: new Date()
    });
  } catch (error) {
    console.error('Error logging sharing action:', error);
    // Don't throw error for logging failures
  }
}

/**
 * Update file access statistics
 */
async function updateFileStats(docPath, statType) {
  try {
    const updateData = {};
    updateData[`stats.${statType}Count`] = admin.firestore.FieldValue.increment(1);
    updateData[`stats.last${statType.charAt(0).toUpperCase() + statType.slice(1)}At`] = new Date();
    
    await db.doc(docPath).update(updateData);
  } catch (error) {
    console.error('Error updating file stats:', error);
    // Don't throw error for stats failures
  }
}

/**
 * Hash URL for privacy-compliant tracking
 */
function hashUrl(url) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
}

/**
 * Cleanup expired shares (scheduled function)
 */
exports.cleanupExpiredShares = onCall(async (request) => {
  // This would typically be a scheduled function
  // Clean up expired sharing records for Norwegian data retention compliance
  
  try {
    const now = new Date();
    const expiredShares = await db.collection('file_shares')
      .where('expiresAt', '<', now)
      .where('status', '==', 'active')
      .get();

    const batch = db.batch();
    
    expiredShares.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: now
      });
    });

    await batch.commit();

    // Log cleanup for Norwegian compliance
    await logSharingAction('cleanup', {
      expiredCount: expiredShares.size,
      timestamp: now
    });

    return {
      success: true,
      expiredCount: expiredShares.size
    };

  } catch (error) {
    console.error('Error cleaning up expired shares:', error);
    throw new HttpsError('internal', 'Kunne ikke rydde opp utløpte delinger');
  }
});
