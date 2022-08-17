import { OmitType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { CreateForumDto } from './create-forum.dto';

export class UpdateForumDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  parentForumId?: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  categoryId?: string;
}
