import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { FilterDto } from '../dto/filter.dto';

export const QueryFilter = createParamDecorator(
  (handler: (req: Request) => {}, ctx: ExecutionContext): FilterDto => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.size ? +req.query.size : 10;
    const offset = (page - 1) * limit;

    let data = {};
    if (handler) data = handler(req);

    return {
      ...req.query,
      page,
      size: limit,
      limit,
      offset,
      ...data,
    };
  },
);
