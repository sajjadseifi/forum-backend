import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AUTH_USER } from 'src/common/constants';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    if (!req[AUTH_USER]) {
      throw new UnauthorizedException('کاربر اهراز هویت نشده است.');
    }
    return req[AUTH_USER];
  },
);
