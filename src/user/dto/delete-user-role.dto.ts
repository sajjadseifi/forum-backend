import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { RoleSection } from '../entity/user-role.entity';

export class DeleteUserRoleDto {
  @IsEnum(RoleSection)
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  sections?: RoleSection[];

  @IsBoolean()
  @IsOptional()
  all?: boolean;
}
