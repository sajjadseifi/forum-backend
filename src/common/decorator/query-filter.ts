import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { FilterDto } from '../dto/filter.dto';

export const QueryFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FilterDto => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.size ? +req.query.size : 10;
    const offset = (page - 1) * limit;

    console.log(req.query);
    return {
      ...req.query,
      page,
      size: limit,
      limit,
      offset,
    };
  },
);
