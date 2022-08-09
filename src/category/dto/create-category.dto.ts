import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 40)
  persianName: string;
}
