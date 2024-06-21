import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ActivePostDto {
  @IsBoolean()
  @IsOptional()
  @Transform((p) => p.value === 'true', {
    toPlainOnly: true,
    toClassOnly: true,
  })
  flag: boolean;
}
