export type UserRole = 'user' | 'owner';

export interface User {
  name: string;
  email: string;
  roles: UserRole[];
  avatar_url?: string;
}
