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
import { AuthUser } from 'src/auth/auth.decorator';
import { QueryFilter } from 'src/common/decorator/query-filter';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ExistForumGard } from 'src/forum/forum.gard';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { LikeTopicDto } from './dto/like-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ExistTopic, IsOwnerTopic } from './topic.gard';
import { TopicService } from './topic.service';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('/')
  getTopicByFilter(@QueryFilter() filterDto: FilterDto) {
    return this.topicService.getTopicsByFilter(filterDto);
  }

  @Get('/forum/:forumID')
  getForumTopicsByFilter(
    @Param('forumID') forumID: string,
    @QueryFilter() filterDto: FilterDto,
  ) {
    return this.topicService.getTopicsByFilter(filterDto, forumID);
  }

  @Get(':topicID')
  async getTopic(@Param('topicID') topicID: string) {
    const topic = await this.topicService.getTopicById(topicID);
    //get 10 top post
    // const post = await topic.loadPostPaginate(0, 10);
    return {
      topic,
      // post,
    };
  }

  @Post('/:forumID')
  @UseGuards(ExistForumGard)
  createTopic(
    @Param('forumID', ParseUUIDPipe) forumID: string,
    @AuthUser() user: User,
    @Body() createTopicDto: CreateTopicDto,
  ) {
    return this.topicService.createTopic(forumID, user, createTopicDto);
  }

  @Put(':topicID')
  @UseGuards(IsOwnerTopic)
  @UseGuards(ExistTopic)
  updateTopic(
    @Param('topicID') topicID: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicService.updateTopic(topicID, updateTopicDto);
  }

  @Delete(':topicID')
  @UseGuards(IsOwnerTopic)
  @UseGuards(ExistTopic)
  deleteTopic(@Param('topicID') topicID: string, @AuthUser() user: User) {
    return this.topicService.deleteTopic(topicID);
  }

  @Get(':topicID/like')
  @UseGuards(ExistTopic)
  likeTopic(
    @Param('topicID') topicID: string,
    @AuthUser() user: User,
    @Query() likeTopicDTO: LikeTopicDto,
  ) {
    return this.topicService.likeTopic(topicID, user.id, likeTopicDTO.flag);
  }
  @Get(':topicID/seen')
  @UseGuards(ExistTopic)
  async seenTopicByUser(@Param('topicID') topicID: string) {
    await this.topicService.seenTopic(topicID);
    return {
      ok: true,
    };
  }
}
