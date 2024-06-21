import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { FilterDto } from 'src/common/dto/filter.dto';
import { paginationResult } from 'src/common/filter/pagination';
import { Topic } from 'src/topic/topic.entity';
import { User } from 'src/user/user.entity';
import { In, Like, Not, IsNull, Equal, Repository } from 'typeorm';
import { CreateForumDto } from './dto/create-forum.dto';
import { FroumFilterMode, GetFroumFilterDto } from './dto/get-filter-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { Forum } from './forum.entity';

@Injectable()
export class ForumService {
  constructor(
    private readonly categoryService: CategoryService,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  async getForumByID(forumID: string, user?: User) {
    const where: any = { id: forumID };

    if (user) where.user = user;

    const forum = await this.forumRepository.findOne({
      where,
      relations: ['user'],
    });
    if (!forum) {
      throw new NotFoundException(`انجمن با ایدی '${forumID}' پیدا نشد`);
    }

    return forum;
  }
  async getForumOfUserByID(user: User, forumID: string) {
    const forum = await this.forumRepository.findOne({
      where: { id: forumID, user },
    });
    if (!forum) {
      throw new NotFoundException(`انجمن با ایدی '${forumID}' پیدا نشد`);
    }

    return forum;
  }
  async isOriginalForum(forumID: string) {
    const forum = await this.forumRepository.findOne({
      select: ['id', 'parentForumId'],
      where: { id: forumID },
    });

    return forum && forum.parentForumId === null;
  }

  getAllOriginForums(select?: (keyof Forum)[]) {
    return this.forumRepository.find({
      where: { parentForumId: null },
      ...(select ? { select } : {}),
      relations: ['category', 'user'],
    });
  }
  getFroumsByIDs(ids: string[], select?: (keyof Forum)[]) {
    return this.forumRepository.find({
      where: { parentForumId: In(ids) },
      relations: ['user'],
      ...(select ? { select } : {}),
    });
  }
  async getAllForumsBySubForums() {
    const forums = await this.getAllOriginForums([
      'id',
      'category',
      'title',
      'createAt',
    ]);

    for (let i = 0; i < forums.length; i++) {
      await forums[i].loadSubForums(['id', 'title', 'parentForumId']);
      await forums[i].loadTopics(2);
    }

    return forums;
  }
  async getAllForumsAndSubForumsByCategory() {
    const forums = await this.getAllForumsBySubForums();
    const categoriedForums = new Map();
    //initialize map
    forums.forEach((f) =>
      categoriedForums.set(f.category?.id, {
        category: f.category,
        forums: [],
      }),
    );
    forums.forEach((f) => {
      const categoryId = f.category?.id;
      const data = categoriedForums.get(categoryId) ?? [];
      delete f.category;
      data.forums = [...data.forums, f];
      categoriedForums.set(categoryId, data);
    });
    const data: any[] = [];
    let froumBase = {};
    categoriedForums.forEach((f, index) => {
      if (!f.category) {
        froumBase = f;
      } else {
        data.push(f);
      }
    });

    return [froumBase, ...data];
  }
  async getForumsOrSubForumsByPagination(
    filterDto: GetFroumFilterDto,
    forumID?: string,
  ) {
    const where: any[] = [];
    let pw: any = {};
    if (filterDto.mode === FroumFilterMode.ORIGIN) {
      pw.parentForumId = IsNull();
    }
    if (filterDto.mode === FroumFilterMode.SUB) {
      pw.parentForumId = Not(IsNull());
    } else if (forumID) {
      pw.parentForumId = forumID;
    }
    if (filterDto.search) {
      where.push({ title: Like(`%${filterDto.search}%`), ...pw });
      where.push({ description: Like(`%${filterDto.search}%`), ...pw });
    } else {
      where.push(pw);
    }

    const [forums, counts] = await this.forumRepository.findAndCount({
      where,
      skip: filterDto.offset,
      take: filterDto.limit,
      relations: ['category', 'user'],
    });

    return paginationResult(forums, counts, filterDto);
  }

  async createForum(user: User, createForumDto: CreateForumDto) {
    const category = await this.categoryService.getCategory(
      createForumDto.categoryId,
    );

    let forum = this.forumRepository.create({
      user,
      category,
      ...createForumDto,
    });

    return this.forumRepository.save(forum);
  }

  async updateForum(
    forumID: string,
    user: User,
    updateForumDto: UpdateForumDto,
  ) {
    const forum = await this.getForumOfUserByID(user, forumID);
    if (forum.category?.id != updateForumDto.categoryId) {
      const category = await this.categoryService.getCategory(
        updateForumDto.categoryId,
      );
      forum.category = category;
    }

    const result = await this.forumRepository.update(forumID, {
      title: updateForumDto.title ?? forum.title,
      parentForumId: updateForumDto.parentForumId ?? forum.parentForumId,
      description: updateForumDto.description ?? forum.description,
      category: forum.category,
    });

    return result.affected > 0;
  }

  async deleteForum(forumID: string, user: User) {
    //remove parent of sub forum
    const resultUpdateSubForum = await this.forumRepository.update(
      {
        parentForumId: forumID,
      },
      {
        parentForumId: null,
      },
    );
    const forum = await this.forumRepository.findOne({ id: forumID });
    const updatedTopic = await this.topicRepository.update(
      { forum },
      {
        forum: null,
      },
    );
    const resultDeletedForum = await this.forumRepository.delete(forumID);

    return {
      deleted: resultDeletedForum.affected > 0,
      updatedSubForum: resultUpdateSubForum.affected,
    };
  }

  async getUserForums(userId: string, filterDto: FilterDto) {
    const result = await this.forumRepository.findAndCount({
      where: {
        user: userId,
      },
      skip: filterDto.offset,
      take: filterDto.limit,
      relations: ['user'],
    });

    return paginationResult(result[0], result[1], filterDto);
  }
}
