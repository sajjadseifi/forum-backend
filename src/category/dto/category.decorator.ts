import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const OwnerCategory = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    console.log(req);
  },
);
