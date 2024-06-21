import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import { LikeFlag } from 'src/common/dto/like.dto';
import { paginationResult } from 'src/common/filter/pagination';
import { countRepository } from 'src/common/repository/counts-repository';
import { ForumService } from 'src/forum/forum.service';
import { User } from 'src/user/user.entity';
import {
  createQueryBuilder,
  getConnection,
  In,
  Like,
  Repository,
} from 'typeorm';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './topic.entity';
import { Posts } from '../post/post.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    private readonly forumService: ForumService,
  ) {}

  async getTopicById(topicID: string, user?: User, error?: boolean) {
    const where: any = { id: topicID };

    if (user) where.user = user;

    const topic = await this.topicRepository.findOne({
      where,
      relations: ['forum', 'user'],
    });

    if (error !== false && !topic) {
      throw new NotFoundException(
        `تاپیک مورد نظر با ایدی '${topicID}' یافت نشد.`,
      );
    }

    return topic;
  }
  async getTopicIsForums(filterDto: FilterDto, forumsId: string[]) {
    if (!forumsId.length) {
      return this.getTopicsByFilter({} as User, filterDto);
    }
    return this.getTopicsByFilter({} as User, filterDto, forumsId);
  }
  async getTopicsByFilter(
    user: User,
    filterDto: FilterDto,
    forumID?: string | string[],
  ) {
    const where: any[] = [];

    if (filterDto.search) {
      const title = Like(`%${filterDto.search}%`);
      const content = Like(`%${filterDto.search}%`);
      where.push({ title });
      where.push({ content });
    }
    const relations = ['user'];
    if (forumID) {
      const forumsIn = typeof forumID === 'string' ? [forumID] : forumID;
      if (forumsIn.length) {
        new Array(where.length).forEach(
          (_, i) => (where[i].forum = In(forumsIn)),
        );
      }
    } else {
      relations.push('forum');
    }

    const result = await this.topicRepository.findAndCount({
      where,
      skip: filterDto.offset,
      take: filterDto.limit,
      relations,
    });
    for (let index = 0; user && index < result[0].length; index++) {
      await result[0][index].userLikedThis(user.id);
    }

    return paginationResult(result[0], result[1], filterDto);
  }
  async createTopic(
    forumID: string,
    user: User,
    createTopicDto: CreateTopicDto,
  ) {
    const forum = await this.forumService.getForumByID(forumID);
    let topic = this.topicRepository.create({ ...createTopicDto, forum, user });
    topic = await this.topicRepository.save(topic);
    return topic;
  }

  async updateTopic(topicID: string, updateTopicDto: UpdateTopicDto) {
    const topic = await this.getTopicById(topicID, null, false);
    topic.title = updateTopicDto.title ?? topic.title;
    topic.content = updateTopicDto.content ?? topic.content;

    const result = await this.topicRepository.update(topic.id, topic);

    const message =
      result.affected > 0 ? 'تاپیک ویرایش شد' : 'تاپیک ویرایش نشد';

    return {
      topic,
      message,
    };
  }

  async deleteTopic(topicId: string) {
    const topic = await this.getTopicById(topicId);
    const deletePosts = await this.postRepository.delete({
      topic,
    });
    const result = await this.topicRepository.delete(topicId);

    return {
      topic,
      message:
        result.affected === 0 ? 'تاپیک مورد نظر حذف نشد' : 'تاپیک حدف شد',
    };
  }

  async likeTopic(topicId: string, userId: string, flag: LikeFlag) {
    const existQuery = createQueryBuilder('user_like_topic', 'l')
      .where('l.topicId = :topicId', { topicId })
      .andWhere('l.userId = :userId', { userId })
      .getSql();
    const res = await getConnection().query(existQuery, [topicId, userId]);

    if (res.length && flag === LikeFlag.DISLIKE) {
      await createQueryBuilder()
        .delete()
        .from('user_like_topic')
        .where('topicId = :topicId', { topicId })
        .andWhere('userId = :userId', { userId })
        .execute();
    } else if (!res.length && flag === LikeFlag.LIKE) {
      await createQueryBuilder('user_like_topic', 'l')
        .insert()
        .values([{ topicId, userId }])
        .execute();
    }
    const counts = await countRepository('user_like_topic', 'topicId', topicId);
    return {
      ok: true,
      flag,
      counts,
    };
  }

  async seenTopic(topicId: string) {
    const topic = await this.getTopicById(topicId);
    await topic.seenedByUser();
  }

  async getUserTopics(userId: string, filterDto: FilterDto) {
    const result = await this.topicRepository.findAndCount({
      where: {
        user: userId,
      },
      skip: filterDto.offset,
      take: filterDto.limit,
      relations: ['forum', 'user'],
    });
    return paginationResult(result[0], result[1], filterDto);
  }
}
