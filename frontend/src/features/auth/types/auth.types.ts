export enum UserRole {
  FOUNDER = "FOUNDER",
  INVENTORY = "INVENTORY",
  PRODUCTION = "PRODUCTION",
  ACCOUNTANT = "ACCOUNTANT",
  CRM = "CRM",
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  password: string;
}