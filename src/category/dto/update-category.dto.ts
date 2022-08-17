import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Category } from '../category.entity';

export class UpdateCategoryDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 40)
  @IsOptional()
  persianName?: string;
}

export class UpdateCategoryOutput extends ResponseDto {}
