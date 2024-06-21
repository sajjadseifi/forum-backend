import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/constants';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  sign(payload: any) {
    return jwt.sign(payload, this.options.privateKey);
  }
  verify(token: string) {
    try {
      return jwt.verify(token, this.options.privateKey);
    } catch (error) {
      throw new UnauthorizedException('شما باید ابتدا وارد سایت شوید');
    }
  }
}
