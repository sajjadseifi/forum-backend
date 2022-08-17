import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import {
  filterRepository,
  filterUserBaseRespository,
} from 'src/common/repository/filter.respository';
import { TopicService } from 'src/topic/topic.service';
import { User } from 'src/user/user.entity';
import { Like, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
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
    });
    if (error !== false && !post) {
      throw new NotFoundException(`پست با ایدی '${postID}' یافت نشد`);
    }

    return post;
  }

  getPostByFilter(filterDto: FilterDto, user?: User) {
    return filterUserBaseRespository<Posts>(
      Posts,
      filterDto,
      {},
      ['content'],
      user,
    );
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
}
