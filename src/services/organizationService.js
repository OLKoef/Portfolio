import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export class OrganizationService {
  
  // Norwegian organization types
  static ORG_TYPES = {
    CLASS: 'klasse',           // School class
    PROJECT: 'prosjektgruppe', // Project group
    COURSE: 'emne',            // Course/subject
    DEPARTMENT: 'avdeling',    // Department
    STUDY_GROUP: 'studiegruppe' // Study group
  };

  // Member roles with Norwegian context
  static MEMBER_ROLES = {
    ADMIN: 'admin',           // Administrator
    MODERATOR: 'moderator',   // Moderator
    MEMBER: 'medlem',         // Regular member
    STUDENT: 'student',       // Student
    TEACHER: 'lærer',         // Teacher
    ASSISTANT: 'assistent'    // Teaching assistant
  };

  // Create new organization (class/project group)
  static async createOrganization(creatorId, orgData) {
    try {
      // Validate organization data
      const validation = this.validateOrganizationData(orgData);
      if (!validation.isValid) {
        throw new Error(`Organisasjonsvalidering feilet: ${validation.errors.join(', ')}`);
      }

      // Generate organization code
      const orgCode = this.generateOrgCode(orgData.name, orgData.type);

      const organization = {
        // Basic info
        name: orgData.name,
        description: orgData.description || '',
        type: orgData.type,
        code: orgCode,
        
        // Norwegian academic info
        courseCode: orgData.courseCode || '',
        semester: orgData.semester || '',
        academicYear: orgData.academicYear || '',
        institution: orgData.institution || '',
        
        // Creator and admin info
        createdBy: creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Settings
        isPublic: orgData.isPublic || false,
        allowFileSharing: orgData.allowFileSharing !== false,
        maxMembers: orgData.maxMembers || 100,
        
        // Norwegian compliance
        gdprCompliant: true,
        dataLocation: 'EU',
        
        // Status
        status: 'active',
        
        // Statistics
        memberCount: 1,
        fileCount: 0,
        totalStorageUsed: 0
      };

      // Create organization document
      const orgRef = await addDoc(collection(db, 'organizations'), organization);
      const orgId = orgRef.id;

      // Add creator as admin
      await this.addMember(orgId, creatorId, this.MEMBER_ROLES.ADMIN, {
        addedBy: creatorId,
        isCreator: true
      });

      return {
        id: orgId,
        ...organization
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new Error(`Kunne ikke opprette organisasjon: ${error.message}`);
    }
  }

  // Add member to organization
  static async addMember(orgId, userId, role = this.MEMBER_ROLES.MEMBER, additionalData = {}) {
    try {
      // Check if organization exists
      const orgDoc = await getDoc(doc(db, 'organizations', orgId));
      if (!orgDoc.exists()) {
        throw new Error('Organisasjonen finnes ikke');
      }

      // Check if user is already a member
      const memberDoc = await getDoc(doc(db, `organizations/${orgId}/members`, userId));
      if (memberDoc.exists()) {
        throw new Error('Brukeren er allerede medlem av organisasjonen');
      }

      // Check member limit
      const orgData = orgDoc.data();
      if (orgData.memberCount >= orgData.maxMembers) {
        throw new Error('Organisasjonen har nådd maksimalt antall medlemmer');
      }

      const memberData = {
        userId,
        role,
        joinedAt: new Date(),
        addedBy: additionalData.addedBy || null,
        isCreator: additionalData.isCreator || false,
        status: 'active',
        permissions: this.getRolePermissions(role),
        
        // Norwegian student info (optional)
        studentId: additionalData.studentId || '',
        program: additionalData.program || '',
        yearOfStudy: additionalData.yearOfStudy || '',
        
        // Activity tracking
        lastActive: new Date(),
        filesUploaded: 0,
        filesDownloaded: 0
      };

      // Add member document
      await setDoc(doc(db, `organizations/${orgId}/members`, userId), memberData);

      // Update organization member count
      await updateDoc(doc(db, 'organizations', orgId), {
        memberCount: orgData.memberCount + 1,
        updatedAt: new Date()
      });

      return memberData;
    } catch (error) {
      console.error('Error adding member:', error);
      throw new Error(`Kunne ikke legge til medlem: ${error.message}`);
    }
  }

  // Remove member from organization
  static async removeMember(orgId, userId, removedBy) {
    try {
      // Check if member exists
      const memberDoc = await getDoc(doc(db, `organizations/${orgId}/members`, userId));
      if (!memberDoc.exists()) {
        throw new Error('Medlemmet finnes ikke i organisasjonen');
      }

      const memberData = memberDoc.data();
      
      // Prevent removing creator
      if (memberData.isCreator) {
        throw new Error('Kan ikke fjerne oppretteren av organisasjonen');
      }

      // Remove member document
      await deleteDoc(doc(db, `organizations/${orgId}/members`, userId));

      // Update organization member count
      const orgDoc = await getDoc(doc(db, 'organizations', orgId));
      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        await updateDoc(doc(db, 'organizations', orgId), {
          memberCount: Math.max(0, orgData.memberCount - 1),
          updatedAt: new Date()
        });
      }

      // Log removal for audit trail
      await this.logMemberAction('removed', {
        orgId,
        userId,
        removedBy,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error removing member:', error);
      throw new Error(`Kunne ikke fjerne medlem: ${error.message}`);
    }
  }

  // Update member role
  static async updateMemberRole(orgId, userId, newRole, updatedBy) {
    try {
      const memberRef = doc(db, `organizations/${orgId}/members`, userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Medlemmet finnes ikke');
      }

      const memberData = memberDoc.data();
      
      // Prevent changing creator role
      if (memberData.isCreator && newRole !== this.MEMBER_ROLES.ADMIN) {
        throw new Error('Kan ikke endre rolle for oppretteren');
      }

      await updateDoc(memberRef, {
        role: newRole,
        permissions: this.getRolePermissions(newRole),
        updatedAt: new Date(),
        updatedBy
      });

      // Log role change
      await this.logMemberAction('role_changed', {
        orgId,
        userId,
        oldRole: memberData.role,
        newRole,
        updatedBy,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error updating member role:', error);
      throw new Error(`Kunne ikke oppdatere medlemsrolle: ${error.message}`);
    }
  }

  // Get organization members
  static async getMembers(orgId, filters = {}) {
    try {
      let membersQuery = collection(db, `organizations/${orgId}/members`);
      
      // Add role filter if specified
      if (filters.role) {
        membersQuery = query(membersQuery, where('role', '==', filters.role));
      }

      // Add status filter
      if (filters.status) {
        membersQuery = query(membersQuery, where('status', '==', filters.status));
      } else {
        membersQuery = query(membersQuery, where('status', '==', 'active'));
      }

      // Order by join date
      membersQuery = query(membersQuery, orderBy('joinedAt', 'desc'));

      const snapshot = await getDocs(membersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  }

  // Get user's organizations
  static async getUserOrganizations(userId) {
    try {
      // This is a collection group query across all organization member collections
      const membershipsQuery = query(
        collection(db, 'organizations'),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(membershipsQuery);
      const organizations = [];

      // Check each organization for user membership
      for (const orgDoc of snapshot.docs) {
        const memberDoc = await getDoc(doc(db, `organizations/${orgDoc.id}/members`, userId));
        if (memberDoc.exists() && memberDoc.data().status === 'active') {
          organizations.push({
            id: orgDoc.id,
            ...orgDoc.data(),
            memberInfo: memberDoc.data()
          });
        }
      }

      return organizations.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    } catch (error) {
      console.error('Error getting user organizations:', error);
      throw error;
    }
  }

  // Join organization by invitation code
  static async joinByCode(userId, orgCode) {
    try {
      // Find organization by code
      const orgsQuery = query(
        collection(db, 'organizations'),
        where('code', '==', orgCode.toUpperCase()),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(orgsQuery);
      if (snapshot.empty) {
        throw new Error('Ugyldig organisasjonskode');
      }

      const orgDoc = snapshot.docs[0];
      const orgData = orgDoc.data();

      // Check if organization allows public joining
      if (!orgData.isPublic) {
        throw new Error('Denne organisasjonen krever invitasjon');
      }

      // Add user as member
      await this.addMember(orgDoc.id, userId, this.MEMBER_ROLES.MEMBER);

      return {
        id: orgDoc.id,
        ...orgData
      };
    } catch (error) {
      console.error('Error joining organization:', error);
      throw new Error(`Kunne ikke bli med i organisasjonen: ${error.message}`);
    }
  }

  // Generate organization invite code
  static generateOrgCode(name, type) {
    const prefix = type === this.ORG_TYPES.CLASS ? 'KL' :
                   type === this.ORG_TYPES.PROJECT ? 'PG' :
                   type === this.ORG_TYPES.COURSE ? 'EM' :
                   type === this.ORG_TYPES.STUDY_GROUP ? 'SG' : 'ORG';
    
    const nameCode = name.replace(/[^a-zA-ZæøåÆØÅ]/g, '').substring(0, 4).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `${prefix}${nameCode}${randomCode}`;
  }

  // Get role permissions
  static getRolePermissions(role) {
    const permissions = {
      [this.MEMBER_ROLES.ADMIN]: [
        'manage_members', 'manage_files', 'manage_org', 'delete_org',
        'upload_files', 'download_files', 'view_members', 'invite_members'
      ],
      [this.MEMBER_ROLES.MODERATOR]: [
        'manage_files', 'upload_files', 'download_files', 
        'view_members', 'invite_members'
      ],
      [this.MEMBER_ROLES.TEACHER]: [
        'manage_files', 'upload_files', 'download_files', 
        'view_members', 'invite_members'
      ],
      [this.MEMBER_ROLES.ASSISTANT]: [
        'upload_files', 'download_files', 'view_members'
      ],
      [this.MEMBER_ROLES.MEMBER]: [
        'upload_files', 'download_files', 'view_members'
      ],
      [this.MEMBER_ROLES.STUDENT]: [
        'upload_files', 'download_files', 'view_members'
      ]
    };

    return permissions[role] || permissions[this.MEMBER_ROLES.MEMBER];
  }

  // Validate organization data
  static validateOrganizationData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Organisasjonsnavn må være minst 2 tegn');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Organisasjonsnavn kan ikke være lengre enn 100 tegn');
    }

    if (!data.type || !Object.values(this.ORG_TYPES).includes(data.type)) {
      errors.push('Ugyldig organisasjonstype');
    }

    if (data.maxMembers && (data.maxMembers < 1 || data.maxMembers > 1000)) {
      errors.push('Maksimalt antall medlemmer må være mellom 1 og 1000');
    }

    // Norwegian course code validation
    if (data.courseCode && !/^[A-Z]{2,5}[0-9]{3,4}$/.test(data.courseCode)) {
      errors.push('Ugyldig emnekode format (f.eks. TKT4140)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Log member actions for audit trail
  static async logMemberAction(action, data) {
    try {
      await addDoc(collection(db, 'organization_logs'), {
        action,
        ...data,
        loggedAt: new Date()
      });
    } catch (error) {
      console.error('Error logging member action:', error);
      // Don't throw error for logging failures
    }
  }

  // Get organization statistics
  static async getOrganizationStats(orgId) {
    try {
      const [orgDoc, membersSnapshot] = await Promise.all([
        getDoc(doc(db, 'organizations', orgId)),
        getDocs(collection(db, `organizations/${orgId}/members`))
      ]);

      if (!orgDoc.exists()) {
        throw new Error('Organisasjonen finnes ikke');
      }

      const orgData = orgDoc.data();
      const members = membersSnapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const activeMembers = members.filter(m => m.status === 'active').length;
      const roleDistribution = {};
      members.forEach(member => {
        roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
      });

      const totalFilesUploaded = members.reduce((sum, m) => sum + (m.filesUploaded || 0), 0);
      const totalFilesDownloaded = members.reduce((sum, m) => sum + (m.filesDownloaded || 0), 0);

      return {
        id: orgId,
        name: orgData.name,
        type: orgData.type,
        createdAt: orgData.createdAt,
        memberCount: activeMembers,
        roleDistribution,
        fileCount: orgData.fileCount || 0,
        totalStorageUsed: orgData.totalStorageUsed || 0,
        totalFilesUploaded,
        totalFilesDownloaded,
        lastActivity: Math.max(...members.map(m => 
          m.lastActive?.toDate ? m.lastActive.toDate().getTime() : 0
        ))
      };
    } catch (error) {
      console.error('Error getting organization stats:', error);
      throw error;
    }
  }
}
