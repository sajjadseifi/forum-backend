import { IsEnum, IsOptional } from 'class-validator';
import { FilterDto } from 'src/common/dto/filter.dto';

export enum FroumFilterMode {
  ALL = 'ALL',
  ORIGIN = 'ORIGIN',
}

export class GetFroumFilterDto extends FilterDto {
  @IsEnum(FroumFilterMode)
  @IsOptional()
  mode?: FroumFilterMode = FroumFilterMode.ALL;
}
