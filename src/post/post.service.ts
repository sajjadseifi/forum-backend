import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import { paginationResult } from 'src/common/filter/pagination';
import { filterUserBaseRespository } from 'src/common/repository/filter.respository';
import { Forum } from 'src/forum/forum.entity';
import { Topic } from 'src/topic/topic.entity';
import { TopicService } from 'src/topic/topic.service';
import { User } from 'src/user/user.entity';
import { In, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PostFilterDto } from './dto/filter-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  disLikCounts,
  likeCounts,
  LikePost,
  LikePostStatus,
} from './like-post.entity';
import { Posts } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(LikePost)
    private readonly likePostRepository: Repository<LikePost>,
    @InjectRepository(User)
    private readonly uerRepository: Repository<User>,

    private readonly topicService: TopicService,
  ) {}

  async createPost(topicID: string, user: User, createPostDto: CreatePostDto) {
    const topic = await this.topicService.getTopicById(topicID);
    let post = this.postRepository.create({ ...createPostDto, user, topic });

    post = await this.postRepository.save(post);

    return {
      post,
      message: 'پست جدید ایجاد شد',
    };
  }

  async getPostById(postID: string, user?: User, error?: boolean) {
    const where: any = { id: postID };
    if (user) where.user = user;

    const post = this.postRepository.findOne({
      where,
      relations: ['user'],
    });

    if (error !== false && !post) {
      throw new NotFoundException(`پست با ایدی '${postID}' یافت نشد`);
    }

    return post;
  }

  getPostByFilter(filterDto: PostFilterDto, user?: User) {
    const acceptedIn = filterDto.show ? [true, false] : [true];
    return filterUserBaseRespository<Posts>(
      Posts,
      filterDto,
      {
        accepted: In(acceptedIn),
      },
      ['content'],
      user,
      ['user', 'topic'],
    );
  }

  async activePost(psotId: string, activeFlag: boolean) {
    const accepted = !!activeFlag;
    const result = await this.postRepository.update(psotId, {
      accepted,
    });
    return {
      ok: result.affected > 0,
      accepted,
    };
  }

  async updatePost(postID: string, updatePostDto: UpdatePostDto) {
    const post = await this.getPostById(postID);
    post.content = updatePostDto.content;

    const result = await this.postRepository.update(postID, post);
    const ok = result.affected > 0;
    return {
      post,
      ok,
      message: ok ? 'پست مورد نظر ویرایش شد' : 'پست مورد نظر ویرایش نشد',
    };
  }

  async deletePost(postID: string) {
    const post = await this.getPostById(postID);

    const result = await this.postRepository.delete(postID);

    const ok = result.affected > 0;
    return {
      post,
      ok,
      message: ok ? 'پست مورد نظر حذف شد' : 'پست مورد نظر حذف نشد',
    };
  }
  async getForumPosts(forumId: string, filter: PostFilterDto) {
    let forumsId: string[] = [forumId];
    if (filter.all) {
      const subs = await this.forumRepository.find({
        select: ['id'],
        where: { parentForumId: forumId },
      });
      forumsId = [{ id: forumId }, ...subs].map((f) => f.id);
    }
    const topics = await this.topicRepository.find({
      select: ['id', 'forum'],
      where: {
        forum: In(forumsId),
      },
    });
    const topicsId = topics.map((t) => t.id);
    const acceptedIn = filter.show ? [true, false] : [true];
    const [posts, postsCount] = await this.postRepository.findAndCount({
      where: {
        topic: In(topicsId),
        accepted: In(acceptedIn),
      },
      skip: filter.offset,
      take: filter.limit,
      relations: ['user', 'topic'],
    });

    return paginationResult(posts, postsCount, filter);
  }
  async getTopicPosts(topicId: string, filter: PostFilterDto) {
    const acceptedIn = filter.show ? [true, false] : [true];

    const [posts, postsCount] = await this.postRepository.findAndCount({
      where: {
        topic: topicId,
        accepted: In(acceptedIn),
      },
      skip: filter.offset,
      take: filter.limit,
      relations: ['user', 'topic'],
    });

    return paginationResult(posts, postsCount, filter);
  }
  async unLikePost(userId: string, postId: string) {
    await this.likePostRepository.delete({
      postId,
      userId,
    });

    const lc = await likeCounts(postId);
    const dc = await disLikCounts(postId);

    return {
      disLikeCounts: dc,
      likeCounts: lc,
    };
  }
  async likePost(userId: string, postId: string, flag: LikePostStatus) {
    const exist = await this.likePostRepository.findOne({
      where: {
        postId,
        userId,
      },
    });

    let likePost = exist;

    if (exist) {
      likePost.status = flag;
    } else {
      likePost = this.likePostRepository.create({
        postId,
        userId,
        status: flag,
      });
    }
    const result = await this.likePostRepository.save(likePost);

    const likeCounts = await result.likeCounts(postId);
    const disLikeCounts = await result.disLikeCounts(postId);

    return {
      disLikeCounts,
      likeCounts,
      flag: result.status,
    };
  }

  async getUserPosts(userId: string, filterDto: FilterDto) {
    const result = await this.postRepository.findAndCount({
      where: {
        user: userId,
      },
      skip: filterDto.offset,
      take: filterDto.limit,
      relations: ['user', 'topic'],
    });
    return paginationResult(result[0], result[1], filterDto);
  }
}
