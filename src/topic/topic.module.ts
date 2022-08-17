import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { ForumService } from 'src/forum/forum.service';
import { CategoryService } from 'src/category/category.service';
import { Forum } from 'src/forum/forum.entity';
import { Category } from 'src/category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Forum, Category])],
  providers: [TopicService, ForumService, CategoryService],
  controllers: [TopicController],
})
export class TopicModule {}
