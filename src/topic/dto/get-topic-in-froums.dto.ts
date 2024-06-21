import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class GetTopicInForumsDto {
  @IsArray()
  @Type(() => String)
  forumsId: string[];
}
