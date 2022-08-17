import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class FilterDto {
  @Min(1)
  @IsInt()
  @Transform((p) => parseInt(p.value) ?? 10)
  @IsNotEmpty()
  page: number;

  @Min(2)
  @IsInt()
  @Transform((p) => parseInt(p.value) ?? 10)
  @IsNotEmpty()
  size: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  search?: string;

  limit?: number;
  offset?: number;
}
