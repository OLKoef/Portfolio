// OrganizationService has been migrated to use Supabase
// Firebase/Firestore integration has been removed

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

  // TODO: Implement all methods using Supabase client
  static async createOrganization(creatorId, orgData) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static async addMember(orgId, userId, role, additionalData) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static async removeMember(orgId, userId, removedBy) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static async updateMemberRole(orgId, userId, newRole, updatedBy) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static async getMembers(orgId, filters = {}) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static async getUserOrganizations(userId) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static async joinByCode(userId, orgCode) {
    throw new Error('Supabase integration required. Please configure Supabase first.');
  }

  static generateOrgCode(name, type) {
    const prefix = type === this.ORG_TYPES.CLASS ? 'KL' :
                   type === this.ORG_TYPES.PROJECT ? 'PG' :
                   type === this.ORG_TYPES.COURSE ? 'EM' :
                   type === this.ORG_TYPES.STUDY_GROUP ? 'SG' : 'ORG';
    
    const nameCode = name.replace(/[^a-zA-ZæøåÆØÅ]/g, '').substring(0, 4).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `${prefix}${nameCode}${randomCode}`;
  }

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
}
