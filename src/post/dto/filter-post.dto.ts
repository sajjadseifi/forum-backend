import { IsBoolean, IsOptional } from 'class-validator';
import { FilterDto } from 'src/common/dto/filter.dto';

export class PostFilterDto extends FilterDto {
  @IsBoolean()
  @IsOptional()
  all: boolean = false;

  show?: boolean;
}
