import { UserRole } from '../users/user-role.enum';

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
}
