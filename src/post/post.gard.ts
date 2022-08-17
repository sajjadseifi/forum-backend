import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { AUTH_USER } from 'src/common/constants';
import { PostService } from './post.service';

@Injectable()
export class IsOwnerPost implements CanActivate {
  constructor(private readonly topicService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const topicID = req.params.topicID;
    if (isUUID(topicID)) {
      const topic = await this.topicService.getPostById(
        topicID,
        req[AUTH_USER],
        false,
      );
      if (!topic) {
        throw new ForbiddenException(
          'شما دسترسی برای تغییر در این پست را ندارید.',
        );
      }
    }

    return true;
  }
}

@Injectable()
export class ExistPost implements CanActivate {
  constructor(private readonly topicService: PostService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const postID = req.params.postID;
    if (isUUID(postID)) {
      await this.topicService.getPostById(postID, null, true);
    }

    return true;
  }
}
