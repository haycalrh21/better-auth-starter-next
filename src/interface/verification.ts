export interface Verification {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  identifier: string;
  value: string;
  expiresAt: Date;
}

export interface VerificationCreateInput {
  id?: string;
  identifier: string;
  value: string;
  expiresAt: Date;
}

export interface VerificationUpdateInput {
  identifier?: string;
  value?: string;
  expiresAt?: Date;
}
