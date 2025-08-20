import { Account } from "./account";
import { UserRole } from "./enums";

import { Guru } from "./guru";
import { Session } from "./session";
import { Siswa } from "./siswa";
import { UserLog } from "./user-log";

export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: UserRole;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  accounts: Account[];
  guru?: Guru;

  sessions: Session[];
  logs: UserLog[];
  siswa?: Siswa;
}

export interface UserCreateInput {
  id?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  role?: UserRole;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string;
  role?: UserRole;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
}

export interface UserWithRelations extends User {
  accounts: Account[];
  guru?: Guru;

  sessions: Session[];
  logs: UserLog[];
  siswa?: Siswa;
}
