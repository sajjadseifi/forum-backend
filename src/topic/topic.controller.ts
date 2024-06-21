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
import { Role } from 'src/auth/role.decorator';
import { QueryFilter } from 'src/common/decorator/query-filter';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ExistForumGard } from 'src/forum/forum.gard';
import { User } from 'src/user/user.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { GetTopicInForumsDto } from './dto/get-topic-in-froums.dto';
import { LikeTopicDto } from './dto/like-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './topic.entity';
import { ExistTopic } from './topic.gard';
import { TopicService } from './topic.service';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('/')
  getTopicByFilter(
    @AuthUser(false) user: User,
    @QueryFilter() filterDto: FilterDto,
  ) {
    return this.topicService.getTopicsByFilter(user, filterDto);
  }
  @Post('/forums')
  getTopicByFilterInFroums(
    @QueryFilter() filterDto: FilterDto,
    @Body() getTopicInForumsDto: GetTopicInForumsDto,
  ) {
    return this.topicService.getTopicIsForums(
      filterDto,
      getTopicInForumsDto.forumsId,
    );
  }

  @Get('/forum/:forumID')
  getForumTopicsByFilter(
    @AuthUser(false) user: User,
    @Param('forumID') forumID: string,
    @QueryFilter() filterDto: FilterDto,
  ) {
    return this.topicService.getTopicsByFilter(user, filterDto, forumID);
  }

  @Get(':topicID')
  async getTopic(@Param('topicID') topicID: string) {
    const topic = await this.topicService.getTopicById(topicID);
    return {
      topic,
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
  @Role(['TOPIC'], Topic, 'topicID')
  updateTopic(
    @Param('topicID') topicID: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicService.updateTopic(topicID, updateTopicDto);
  }

  @Delete(':topicID')
  @Role(['TOPIC'], Topic, 'topicID')
  deleteTopic(@Param('topicID') topicID: string) {
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

  @Get('/user/:userId')
  async getUserTopics(
    @Param('userId') userId: string,
    @QueryFilter() filter: FilterDto,
  ) {
    return this.topicService.getUserTopics(userId, filter);
  }
}
