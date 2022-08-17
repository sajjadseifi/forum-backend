import { IsEnum, IsNotEmpty } from 'class-validator';

export enum LikeFlag {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}
export class LikeDto {
  @IsEnum(LikeFlag)
  @IsNotEmpty()
  flag: LikeFlag;
}
