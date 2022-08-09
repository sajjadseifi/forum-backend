import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ResponseDto } from 'src/common/dto/response.dto';
import { ExactValue } from 'src/common/validator/exact-value';
import { RegisterAuthDTO } from './register.dto';

export class ResetPassowrdDTO extends PickType(RegisterAuthDTO, ['password']) {
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  @ExactValue('password', {
    message: 'رمز عبور و تایید رمز عبور یکسان نیست.',
  })
  confirmPassword: string;
}

export class ResetPasswordOutputDTO extends ResponseDto {
  constructor(ok: boolean, messages: string[]) {
    super(ok, messages);
  }
}
