import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { HelperService } from 'src/helper/helper.service';
import { User } from 'src/user/user.entity';
import { Forum } from 'src/forum/forum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Forum, User])],
  providers: [CategoryService, HelperService],
  controllers: [CategoryController],
})
export class CategoryModule {}
