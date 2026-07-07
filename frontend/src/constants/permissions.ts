import { UserRole } from "./roles";

export const ROLE_PERMISSIONS = {
  [UserRole.FOUNDER]: [
    "dashboard",
    "inventory",
    "bom",
    "production",
    "warehouses",
    "dispatch",
    "crm",
    "attendance",
    "reports",
    "users",
  ],

  [UserRole.INVENTORY]: [
    "inventory",
    "transactions",
  ],

  [UserRole.PRODUCTION]: [
    "production",
    "bom",
  ],

  [UserRole.ACCOUNTANT]: [
    "reports",
    "crm",
  ],

  [UserRole.CRM]: [
    "crm",
    "dispatch",
  ],
};