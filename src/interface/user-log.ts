import { User } from "./user";

export interface UserLog {
  id: string;
  createdAt: Date;
  userId?: string;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  user?: User;
}

export interface UserLogCreateInput {
  id?: string;
  userId?: string;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserLogUpdateInput {
  userId?: string;
  action?: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserLogWithUser extends UserLog {
  user?: User;
}
