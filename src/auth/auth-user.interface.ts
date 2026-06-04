import { UserRole } from '../users/user-role.enum';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}
