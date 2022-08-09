import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ResponseDto } from 'src/common/dto/response.dto';
export class RegisterAuthDTO {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  password: string;

  @IsString()
  @Length(3, 20)
  @IsOptional()
  firstName?: string;

  @IsString()
  @Length(3, 20)
  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class RegisterOutputDTO extends ResponseDto {
  userId: string;

  constructor(data: string | string[]) {
    if (typeof data === 'string') {
      super(true);
      this.userId = data;
    } else {
      super(false, data);
    }
  }
}
