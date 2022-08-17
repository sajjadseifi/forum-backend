import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AUTH_USER } from 'src/common/constants';
import { User } from 'src/user/user.entity';
import { CategoryService } from './category.service';

@Injectable()
export class CategoryOwnerGard implements CanActivate {
  constructor(private readonly categoryService: CategoryService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user: User = req[AUTH_USER];
    const categoryId = req.params.categoryId;
    console.log(req.params);
    const isOwner = await this.categoryService.isOwnerCateory(user, categoryId);
    return isOwner;
  }
}
