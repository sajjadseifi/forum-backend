import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AUTH_USER } from 'src/common/constants';

@Injectable()
export class AuthenticatedGard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    return !!req[AUTH_USER];
  }
}
