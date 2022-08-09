import { ResponseDto } from 'src/common/dto/response.dto';

export class ForgetPasswrdOutputDTO extends ResponseDto {
  resetToken?: string;

  constructor(ok: boolean, messages?: string[], resetToken?: string) {
    super(ok, messages);
    if (resetToken) this.resetToken = resetToken;
  }
}
