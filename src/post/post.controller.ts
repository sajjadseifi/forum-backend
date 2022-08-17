import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/auth.decorator';
import { QueryFilter } from 'src/common/decorator/query-filter';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ExistTopic } from 'src/topic/topic.gard';
import { User } from 'src/user/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ExistPost, IsOwnerPost } from './post.gard';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  getFilterPosts(@QueryFilter() filterDto: FilterDto) {
    return this.postService.getPostByFilter(filterDto);
  }

  @Get('/:postID')
  getPostById(@Param('postID', ParseUUIDPipe) postID: string) {}

  @Post('/:topicID')
  @UseGuards(ExistTopic)
  createPostMessage(
    @Param('topicID', ParseUUIDPipe) topicID: string,
    @AuthUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.createPost(topicID, user, createPostDto);
  }

  @Post('/:postID')
  @UseGuards(IsOwnerPost)
  @UseGuards(ExistPost)
  updatePostMessage(
    @Param('postID', ParseUUIDPipe) postID: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(postID, updatePostDto);
  }

  @Delete('/:postID')
  @UseGuards(IsOwnerPost)
  @UseGuards(ExistPost)
  deletePostMessage(@Param('postID', ParseUUIDPipe) postID: string) {
    return this.postService.deletePost(postID);
  }
}
