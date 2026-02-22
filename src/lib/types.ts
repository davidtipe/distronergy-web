export type Role = "CUSTOMER" | "SUPPLIER" | "DRIVER" | "ADMIN";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: Role;
  isBusinessAdmin: boolean;
  isSuperAdmin: boolean;
  businessId: string;
  defaultLocationId: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  businessName: string;
  role: "CUSTOMER" | "SUPPLIER" | "DRIVER";
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}
