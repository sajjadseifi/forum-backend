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
import { QueryFilter } from 'src/common/decorator/query-filter';
import { FilterDto } from 'src/common/dto/filter.dto';
import { User } from 'src/user/user.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { FroumFilterMode, GetFroumFilterDto } from './dto/get-filter-forum.dto';
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
    for (let i = 0; i < result.forums.length; i++) {
      await result.forums[i].loadTopics(2);
    }

    return result;
  }

  @Get('all/category')
  getForumsWithSubForumsInCategoryWithTopic() {
    return this.forumService.getAllForumsAndSubForumsByCategory();
  }
  @Get('/:forumID')
  async getForum(@Param('forumID') forumID: string) {
    const forum = await this.forumService.getForumByID(forumID);
    return forum;
  }
  @Get('/')
  getForumsByFilter(@QueryFilter() filterDto: GetFroumFilterDto) {
    return this.forumService.getForumsOrSubForumsByPagination(
      filterDto,
      filterDto.mode,
    );
  }
  @Get('/:forumID/sub')
  @UseGuards(IsOriginalForumGard)
  getSubForumsByFilter(
    @Param('forumID', ParseUUIDPipe) forumID: string,
    @QueryFilter() FilterDto: FilterDto,
  ) {
    return this.forumService.getForumsOrSubForumsByPagination(
      FilterDto,
      forumID,
    );
  }

  @Post()
  @UseGuards(ParentIsOriginalForumGard)
  createForum(@AuthUser() user: User, @Body() createForumDto: CreateForumDto) {
    return this.forumService.createForum(user, createForumDto);
  }

  @Put('/:forumID')
  @UseGuards(ParentIsOriginalForumGard)
  @UseGuards(ExistForumGard)
  updateForumById(
    @Param('forumID', ParseUUIDPipe) forumID: string,
    @AuthUser() user: User,
    @Body() updateForumDto: UpdateForumDto,
  ) {
    return this.forumService.updateForum(forumID, user, updateForumDto);
  }

  @Delete(':forumID')
  @UseGuards(ExistForumGard)
  async deleteForumByID(@ForumAccessor() forum: Forum, @AuthUser() user: User) {
    const res = await this.forumService.deleteForum(forum.id, user);
    return {
      ...res,
      forum,
    };
  }
}
