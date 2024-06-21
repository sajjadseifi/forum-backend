import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './forum.entity';
import { CategoryService } from 'src/category/category.service';
import { Category } from 'src/category/category.entity';
import { User } from 'src/user/user.entity';
import { Topic } from 'src/topic/topic.entity';
import { Posts } from 'src/post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, Category, User, Topic, Posts])],
  providers: [ForumService, CategoryService],
  controllers: [ForumController],
})
export class ForumModule {}
