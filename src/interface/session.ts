import { User } from "./user";

export interface Session {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  impersonatedBy?: string;
  userId: string;
  user: User;
}

export interface SessionCreateInput {
  id?: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  impersonatedBy?: string;
  userId: string;
}

export interface SessionUpdateInput {
  expiresAt?: Date;
  token?: string;
  ipAddress?: string;
  userAgent?: string;
  impersonatedBy?: string;
  userId?: string;
}

export interface SessionWithUser extends Session {
  user: User;
}
