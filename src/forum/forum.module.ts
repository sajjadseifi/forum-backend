import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './forum.entity';
import { CategoryService } from 'src/category/category.service';
import { Category } from 'src/category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, Category])],
  providers: [ForumService, CategoryService],
  controllers: [ForumController],
})
export class ForumModule {}
