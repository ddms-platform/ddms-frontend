export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  name: string;
  email: string;
  roles: UserRole[];
  avatar_url?: string;
  phone?: string;
  address?: string;
  hasOwnerProfile?: boolean;
}
