import { PickType } from '@nestjs/mapped-types';
import { ResponseDto } from 'src/common/dto/response.dto';
import { RegisterAuthDTO } from './register.dto';

export class LoginDTO extends PickType(RegisterAuthDTO, [
  'email',
  'password',
]) {}

export class LoginOutputDTO extends ResponseDto {
  accessToken?: string;
  activated?: boolean;

  constructor(data: string | string[], activated?: boolean) {
    if (data instanceof Array) {
      super(false, data);
    } else {
      super(false);
      this.accessToken = data;
    }
    this.activated = !!activated;
  }
}
