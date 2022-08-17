import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateForumDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  title: string;

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
  categoryId: string;
}
