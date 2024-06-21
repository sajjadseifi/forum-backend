import { PartialType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { FilterDto } from 'src/common/dto/filter.dto';
import { UserRole } from '../entity/user-role.entity';

export class BaseRoleUnit extends PickType(PartialType(UserRole), [
  'section',
  'canCreate',
  'canRead',
  'canUpdate',
  'canDelete',
]) {}

export class UserFilterDto extends FilterDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @IsOptional()
  @Type(() => BaseRoleUnit)
  @ValidateNested({ each: true })
  roles?: BaseRoleUnit[];
}
