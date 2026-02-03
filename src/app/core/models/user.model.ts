export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// helpful for forms and API responses:
export type UserCreateDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdateDto = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
