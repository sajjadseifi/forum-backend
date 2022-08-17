import { IsNotEmpty, IsString, Length, Min } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  @Length(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(10)
  content: string;
}
