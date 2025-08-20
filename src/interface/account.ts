import { User } from "./user";

export interface Account {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  userId: string;
  user: User;
}

export interface AccountCreateInput {
  id?: string;
  accountId: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  userId: string;
}

export interface AccountUpdateInput {
  accountId?: string;
  providerId?: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  userId?: string;
}

export interface AccountWithUser extends Account {
  user: User;
}
