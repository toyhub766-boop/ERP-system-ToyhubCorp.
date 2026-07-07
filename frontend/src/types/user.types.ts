import { UserRole } from "../constants/roles";

export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
}