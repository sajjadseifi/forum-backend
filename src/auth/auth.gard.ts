import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { AUTH_USER } from 'src/common/constants';
import { RoleSection, UserRole } from 'src/user/entity/user-role.entity';
import { User } from 'src/user/user.entity';
import { getRepository } from 'typeorm';
import { RoleReflector } from './role.decorator';

@Injectable()
export class AuthenticatedGard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    return !!req[AUTH_USER];
  }
}

@Injectable()
export class AuthGard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const refl = this.reflector.get<RoleReflector>('auth', handler);

    if (!refl) {
      return true;
    }

    const { roles, entity, paramKey } = refl;
    const req: Request = context.switchToHttp().getRequest();
    const user: User = req[AUTH_USER];

    if (entity && user) {
      const id = req.params[paramKey];

      if (!isUUID(id)) {
        throw new BadRequestException('uuid in param not valid');
      }
      const founded: any = await getRepository(entity).findOne({
        where: { id, user },
      });
      if (founded) {
        return true;
      }
    }

    if (!roles.length) {
      return true;
    }
    const userRoles: UserRole[] = user?.roles;

    for (const section of roles) {
      for (const role of userRoles) {
        if (role.section != RoleSection.MAIN && role.section != section)
          continue;

        const accesss =
          (req.method === 'POST' && role.canCreate) ||
          (req.method === 'PUT' && role.canUpdate) ||
          (req.method === 'DELETE' && role.canDelete) ||
          (req.method === 'GET' && role.canRead);

        if (accesss === false) continue;

        return true;
      }
    }

    return false;
  }
}
