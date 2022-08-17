import { Post } from '@nestjs/common';
import { CoreEntity } from 'src/common/entity/core.entity';
import { countRepository } from 'src/common/repository/counts-repository';
import { Forum } from 'src/forum/forum.entity';
import { Posts } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  AfterLoad,
  Column,
  Entity,
  getConnection,
  getRepository,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Topic extends CoreEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 0 })
  seen: number;

  @ManyToOne(() => Forum, (f) => f.topics)
  @JoinTable()
  forum: Forum;

  @ManyToOne(() => User, (u) => u.topics)
  @JoinTable()
  user: User;

  @OneToMany(() => Posts, (p) => p.user)
  posts: Posts[];

  postCounts?: number;

  @ManyToMany(() => User, (u) => u.userlikesTpic)
  @JoinTable({ name: 'user_like_topic' })
  topiclikedUsers: User[];

  likesCounts?: number;

  @AfterLoad()
  async loadPostCounts() {
    this.postCounts = await countRepository('posts', 'topic', this.id);
  }

  @AfterLoad()
  async loadLikeCounts() {
    this.likesCounts = await countRepository(
      'user_like_topic',
      'topicId',
      this.id,
    );
  }
  async seenedByUser() {
    await getRepository(Topic).update(this.id, {
      seen: this.seen + 1,
    });
  }

  async loadPostPaginate(offset: number, limit: number) {
    const posts = await getRepository(Posts).find({
      where: { topic: this },
      order: {
        createAt: 'ASC',
      },
      take: limit,
      skip: offset,
    });
    return posts;
  }
}
