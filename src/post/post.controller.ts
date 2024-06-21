import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/role.decorator';
import { AUTH_USER } from 'src/common/constants';
import { QueryFilter } from 'src/common/decorator/query-filter';
import { FilterDto } from 'src/common/dto/filter.dto';
import { paginationResult } from 'src/common/filter/pagination';
import { ExistTopic } from 'src/topic/topic.gard';
import { RoleSection } from 'src/user/entity/user-role.entity';
import { User } from 'src/user/user.entity';
import { ActivePostDto } from './dto/active-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostFilterDto } from './dto/filter-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './post.entity';
import { ExistPost, IsOwnerPost } from './post.gard';
import { PostService } from './post.service';

const showDeactivedPost = (req: Request) => {
  const user: User = req[AUTH_USER];
  if (!user) return { show: false };

  const showable = user.roles.find(
    (f) => f.section == RoleSection.POST && f.canRead === true,
  );
  return { show: !!showable };
};
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/')
  async getFilterPosts(
    @QueryFilter(showDeactivedPost) filterDto: PostFilterDto,
  ) {
    const res = await this.postService.getPostByFilter(filterDto);
    return paginationResult(res.data, res.countsAll, filterDto);
  }

  @Get('/forum/:forumId')
  getFroumFilterPosts(
    @Param('forumId', ParseUUIDPipe) forumId: string,
    @QueryFilter(showDeactivedPost) filterDto: PostFilterDto,
  ) {
    return this.postService.getForumPosts(forumId, filterDto);
  }
  @Get('/topic/:topicId')
  getTopicFilterPosts(
    @Param('topicId') topicId: string,
    @QueryFilter(showDeactivedPost) filterDto: PostFilterDto,
  ) {
    return this.postService.getTopicPosts(topicId, filterDto);
  }

  @Get('/:postID')
  async getPostById(@Param('postID', ParseUUIDPipe) postID: string) {
    const post = await this.postService.getPostById(postID);
    return {
      post,
    };
  }

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
  @Role(['POST'], Posts, 'postID')
  async deletePostMessage(@Param('postID', ParseUUIDPipe) postID: string) {
    await this.postService.getPostById(postID, null, true);
    return this.postService.deletePost(postID);
  }

  @Get('/:postID/like')
  likePost(
    @Param('postID', ParseUUIDPipe) postID: string,
    @AuthUser() user: User,
    @Query() likePostDto: LikePostDto,
  ) {
    return this.postService.likePost(user.id, postID, likePostDto.flag);
  }

  @Get('/:postID/un-like')
  unlikePost(
    @Param('postID', ParseUUIDPipe) postID: string,
    @AuthUser() user: User,
  ) {
    return this.postService.unLikePost(user.id, postID);
  }
  @Get('/user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @QueryFilter() filter: FilterDto,
  ) {
    return this.postService.getUserPosts(userId, filter);
  }

  @Put('/:postID/active')
  @Role(['POST'], Posts, 'postID')
  activePostByAdmin(
    @Param('postID') postID: string,
    @Query() activePostDto: ActivePostDto,
  ) {
    const flag = activePostDto.flag as any;
    return this.postService.activePost(postID, flag === 'true');
  }
}
