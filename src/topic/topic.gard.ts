import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { AUTH_USER } from 'src/common/constants';
import { TopicService } from './topic.service';

@Injectable()
export class IsOwnerTopic implements CanActivate {
  constructor(private readonly topicService: TopicService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const topicID = req.params.topicID;
    if (isUUID(topicID)) {
      const topic = await this.topicService.getTopicById(
        topicID,
        req[AUTH_USER],
        false,
      );
      if (!topic) {
        throw new ForbiddenException(
          'شما دسترسی برای تغییر در این تاپیک را ندارید.',
        );
      }
    }

    return true;
  }
}

@Injectable()
export class ExistTopic implements CanActivate {
  constructor(private readonly topicService: TopicService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const topicID = req.params.topicID;
    if (isUUID(topicID)) {
      await this.topicService.getTopicById(topicID, null, true);
    }

    return true;
  }
}
