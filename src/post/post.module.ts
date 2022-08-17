import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TopicService } from 'src/topic/topic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/category.entity';
import { Forum } from 'src/forum/forum.entity';
import { Topic } from 'src/topic/topic.entity';
import { ForumService } from 'src/forum/forum.service';
import { CategoryService } from 'src/category/category.service';
import { Posts } from './post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Topic, Forum, Posts])],
  providers: [PostService, ForumService, CategoryService, TopicService],
  controllers: [PostController],
})
export class PostModule {}
