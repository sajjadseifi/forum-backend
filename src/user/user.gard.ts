import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { UserService } from './user.service';

@Injectable()
export class ExistUser implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const userID = req.params.userId;

    if (!isUUID(userID)) {
      throw new BadRequestException('uuid in param not valid');
    }

    const user = await this.userService.getUserById(userID);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    req['user-param'] = user;

    return true;
  }
}
