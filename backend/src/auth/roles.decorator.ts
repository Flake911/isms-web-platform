import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/** Mark a route as public (no JWT required) */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Require minimum role level. Pass the minimum role string. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
