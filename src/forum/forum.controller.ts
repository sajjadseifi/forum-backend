import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/role.decorator';
import { QueryFilter } from 'src/common/decorator/query-filter';
import { FilterDto } from 'src/common/dto/filter.dto';
import { User } from 'src/user/user.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { GetFroumFilterDto } from './dto/get-filter-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ForumAccessor } from './forum.decorator';
import { Forum } from './forum.entity';
import {
  ExistForumGard,
  IsOriginalForumGard,
  ParentIsOriginalForumGard,
} from './forum.gard';
import { ForumService } from './forum.service';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('/all')
  async getForumsWithSubForumsWithTopic() {
    return this.forumService.getAllForumsBySubForums();
  }
  @Get('/all/:forumID/sub')
  @UseGuards(ExistForumGard)
  async getSubForumsWithTopic(
    @Param('forumID', ParseUUIDPipe) forumID: string,
    @QueryFilter() filterDto: FilterDto,
  ) {
    const result = await this.forumService.getForumsOrSubForumsByPagination(
      filterDto,
      forumID,
    );
    for (let i = 0; i < result.data.length; i++) {
      await result.data[i].loadTopics(2);
    }

    return result;
  }

  @Get('all/category')
  getForumsWithSubForumsInCategoryWithTopic() {
    return this.forumService.getAllForumsAndSubForumsByCategory();
  }
  @Get('/:forumID')
  async getForum(@Param('forumID', ParseUUIDPipe) forumID: string) {
    const forum = await this.forumService.getForumByID(forumID);
    return forum;
  }
  @Get('/')
  async getForumsByFilter(@QueryFilter() filterDto: GetFroumFilterDto) {
    const result = await this.forumService.getForumsOrSubForumsByPagination(
      filterDto,
    );
    for (let i = 0; i < result.data.length; i++) {
      await result.data[i].loadTopics(2);
    }
    return result;
  }
  @Get('/:forumID/sub')
  @UseGuards(IsOriginalForumGard)
  async getSubForumsByFilter(
    @Param('forumID', ParseUUIDPipe) forumID: string,
    @QueryFilter() FilterDto: FilterDto,
  ) {
    const result = await this.forumService.getForumsOrSubForumsByPagination(
      FilterDto,
      forumID,
    );
    for (let i = 0; i < result.data.length; i++) {
      await result.data[i].loadTopics(2);
    }
    return result;
  }

  @Post()
  @UseGuards(ParentIsOriginalForumGard)
  @Role(['FORUM'])
  createForum(@AuthUser() user: User, @Body() createForumDto: CreateForumDto) {
    return this.forumService.createForum(user, createForumDto);
  }

  @Put('/:forumID')
  @UseGuards(ParentIsOriginalForumGard)
  @UseGuards(ExistForumGard)
  @Role(['FORUM'], Forum, 'forumID')
  updateForumById(
    @Param('forumID', ParseUUIDPipe) forumID: string,
    @AuthUser() user: User,
    @Body() updateForumDto: UpdateForumDto,
  ) {
    return this.forumService.updateForum(forumID, user, updateForumDto);
  }

  @Delete(':forumID')
  @UseGuards(ExistForumGard)
  @Role(['FORUM'], Forum, 'forumID')
  async deleteForumByID(@ForumAccessor() forum: Forum, @AuthUser() user: User) {
    const res = await this.forumService.deleteForum(forum.id, user);
    return {
      ...res,
      forum,
    };
  }

  @Get('/user/:userId')
  async getUserFroums(
    @Param('userId', ParseUUIDPipe) userId: string,
    @QueryFilter() filter: FilterDto,
  ) {
    return this.forumService.getUserForums(userId, filter);
  }
}
