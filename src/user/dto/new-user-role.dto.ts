import { OmitType } from '@nestjs/mapped-types';
import { UserRole } from '../entity/user-role.entity';

export class NewUserRoleDto extends OmitType(UserRole, [
  'id',
  'user',
  'updateAt',
  'createAt',
]) {}
