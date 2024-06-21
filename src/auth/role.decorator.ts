import { SetMetadata } from '@nestjs/common';
import { RoleSection } from 'src/user/entity/user-role.entity';

export type AllowedRoles = keyof typeof RoleSection | 'Any';

export interface RoleReflector {
  roles: AllowedRoles;
  entity: any;
  paramKey: string;
}
export const Role = (roles: AllowedRoles[], entity?: any, paramKey?: string) =>
  SetMetadata('auth', {
    roles,
    entity,
    paramKey,
  });
