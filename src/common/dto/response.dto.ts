import { Transform } from 'class-transformer';

export class ResponseDto {
  @Transform((p) => !!p.value)
  ok: boolean;

  messages?: string[];

  constructor(ok: boolean, messages?: string[]) {
    (this.ok = ok), (this.messages = messages);
  }
}
