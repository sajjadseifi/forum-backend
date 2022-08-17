import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FORUM } from 'src/common/constants';

export const ForumAccessor = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    if (!req[FORUM]) {
      throw new UnauthorizedException('انجمن مورد نظر پیدا نشد.');
    }
    return req[FORUM];
  },
);
