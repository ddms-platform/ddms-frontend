export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatar_url?: string;
  phone?: string;
  address?: string;
  hasOwnerProfile?: boolean;
  ownerProfileStatus?: string;
}
