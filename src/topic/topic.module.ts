import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { ForumService } from 'src/forum/forum.service';
import { CategoryService } from 'src/category/category.service';
import { Forum } from 'src/forum/forum.entity';
import { Category } from 'src/category/category.entity';
import { User } from 'src/user/user.entity';
import { Posts } from 'src/post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Forum, Category, User, Posts])],
  providers: [TopicService, ForumService, CategoryService],
  controllers: [TopicController],
})
export class TopicModule {}
