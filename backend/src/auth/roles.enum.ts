export enum Role {
  Employee = 'Employee',
  SecurityOfficer = 'Security Officer',
  Auditor = 'Auditor',
  ISMSManager = 'ISMS Manager',
  OrgAdmin = 'Organization Admin',
  SuperAdmin = 'Super Admin',
}

// Numeric hierarchy — higher = more permissions
export const RoleLevel: Record<string, number> = {
  [Role.Employee]: 1,
  [Role.SecurityOfficer]: 2,
  [Role.Auditor]: 3,
  [Role.ISMSManager]: 4,
  [Role.OrgAdmin]: 5,
  [Role.SuperAdmin]: 6,
};
