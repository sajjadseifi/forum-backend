import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import * as requestIp from 'request-ip';

export const IpAddress = createParamDecorator((_, req: Request) => {
  if (req.clientIp) return req.clientIp;
  return requestIp.getClientIp(req);
});
