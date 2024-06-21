import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { FilterDto } from 'src/common/dto/filter.dto';

export enum FroumFilterMode {
  ALL = 'ALL',
  SUB = 'SUB',
  ORIGIN = 'ORIGIN',
}

export class GetFroumFilterDto extends FilterDto {
  @IsEnum(FroumFilterMode)
  @IsOptional()
  mode?: FroumFilterMode = FroumFilterMode.ALL;

  @IsString()
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
