export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

export enum UserRole {
    Admin = "Admin",
    Coordinator = "Coordinator"
}