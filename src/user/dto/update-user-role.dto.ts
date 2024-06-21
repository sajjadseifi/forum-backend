import { OmitType, PartialType } from '@nestjs/mapped-types';
import { NewUserRoleDto } from './new-user-role.dto';

export class UpdateUserRoleDto extends PartialType(
  OmitType(NewUserRoleDto, ['author', 'section']),
) {}
