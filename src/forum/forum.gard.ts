import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { FORUM } from 'src/common/constants';
import { ForumService } from './forum.service';

@Injectable()
export class ParentIsOriginalForumGard implements CanActivate {
  constructor(private readonly forumService: ForumService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const parentForumId = req.body.parentForumId;
    if (isUUID(parentForumId)) {
      const isOrigin = await this.forumService.isOriginalForum(parentForumId);
      if (!isOrigin) {
        throw new BadRequestException(
          'انجمن انتخاب شده یک انجمن اصلی نمی باشد.',
        );
      }
    }

    return true;
  }
}

@Injectable()
export class IsOriginalForumGard implements CanActivate {
  constructor(private readonly forumService: ForumService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const forumID = req.params.forumID;
    if (isUUID(forumID)) {
      const isOrigin = await this.forumService.isOriginalForum(forumID);

      if (!isOrigin) {
        throw new BadRequestException('این انجمن یک انجمن اصلی نمی باشد.');
      }
    }

    return true;
  }
}

@Injectable()
export class ExistForumGard implements CanActivate {
  constructor(private readonly forumService: ForumService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const forumID = req.params.forumID;
    if (isUUID(forumID)) {
      req[FORUM] = await this.forumService.getForumByID(forumID);
    }

    return true;
  }
}
