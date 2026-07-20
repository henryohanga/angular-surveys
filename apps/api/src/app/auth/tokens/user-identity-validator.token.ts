export const USER_IDENTITY_VALIDATOR = 'USER_IDENTITY_VALIDATOR';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  workspaceId?: string;
}

export interface ValidatedIdentity {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId?: string;
  externalId?: string;
}

export interface IUserIdentityValidator {
  validate(payload: JwtPayload): Promise<ValidatedIdentity | null>;
}
