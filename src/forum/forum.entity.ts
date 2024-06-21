import { HttpServer, Req } from '@nestjs/common';
import { PartialType, PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { Category } from 'src/category/category.entity';
import { CoreEntity } from 'src/common/entity/core.entity';
import { countRepository } from 'src/common/repository/counts-repository';
import { app } from 'src/main';
import { Topic } from 'src/topic/topic.entity';
import { UserRole } from 'src/user/entity/user-role.entity';
import { User } from 'src/user/user.entity';
import {
  AfterLoad,
  Column,
  createQueryBuilder,
  Entity,
  getConnection,
  getRepository,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';

class AccessEntity extends PartialType(
  PickType(UserRole, ['canCreate', 'canRead', 'canUpdate', 'canDelete']),
) {}
@Entity()
export class Forum extends CoreEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  parentForumId: string;

  @ManyToOne(() => User, (u) => u.forums)
  @JoinTable()
  user: User;

  @ManyToOne(() => Category, (f) => f.forums)
  @JoinTable()
  category?: Category;

  @OneToMany(() => Topic, (t) => t.forum)
  topics: Topic[];

  subForums?: Forum[];

  isSubForum?: boolean;

  subForumsCounts?: number;

  topicCounts?: number;
  topicNestedCounts?: number;

  parentForum?: Forum;

  access?: AccessEntity;
  @AfterLoad()
  async checkIsSubForum() {
    this.isSubForum = !!this.parentForumId;
    if (this.isSubForum) {
      this.parentForum = await getRepository(Forum).findOne({
        select: ['id', 'title'],
        where: { id: this.parentForumId },
      });
    }
  }

  @AfterLoad()
  async loadSubForumsCounts() {
    this.subForumsCounts = await countRepository(
      'forum',
      'parentForumId',
      this.id,
    );
  }

  @AfterLoad()
  async loadTopicsCount() {
    this.topicCounts = await countRepository('topic', 'forum', this.id);

    if (!this.parentForumId) {
      const forumSql = createQueryBuilder('forum', 'f')
        .select('f.id', 'id')
        .where('f.parentForumId = :forumId', { forumId: this.id })
        .getSql();
      const forums: any[] = await getConnection().query(forumSql, [this.id]);
      const ids: string[] = forums.map((f) => f.id);

      if (ids.length) {
        const topicNestedCounts = await countRepository('topic', 'forum', ids);
        this.topicNestedCounts = this.topicCounts + topicNestedCounts;
      }
    }
  }

  async loadSubForums(select?: (keyof Forum)[]) {
    const query = createQueryBuilder('forum', 'f')
      .where('f.parentForumId = :forumId', { forumId: this.id })
      .limit(10);

    if (select.length) {
      query.select(`f.${select[0]}`, `${select[0]}`);
    }
    select.slice(1).map((s) => query.addSelect(`f.${s}`, `${s}`));

    const subForums: any[] = await getConnection().query(query.getSql(), [
      this.id,
    ]);

    this.subForums = subForums;
  }

  async loadTopics(count: number) {
    this.topics = await getRepository(Topic).find({
      select: ['id', 'title', 'content', 'createAt', 'user'],
      relations: ['user'],
      where: { forum: this },
      take: count,
    });
    return this.topics;
  }

  // @AfterLoad()
  async userAccess(userId: string) {
    const user = await getRepository(User).findOne({
      where: {
        id: userId,
      },
      relations: ['roles'],
    });
  }
}
