export const UserRole = {
  FOUNDER: "FOUNDER",
  ADMIN: "ADMIN",
  PRODUCTION: "PRODUCTION",
  ACCOUNTANT: "ACCOUNTANT",
  CRM: "CRM",
  INVENTORY: "INVENTORY",
  HR: "HR",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];