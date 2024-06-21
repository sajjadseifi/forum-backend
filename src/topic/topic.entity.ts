import { Post } from '@nestjs/common';
import { CoreEntity } from 'src/common/entity/core.entity';
import { countRepository } from 'src/common/repository/counts-repository';
import { Forum } from 'src/forum/forum.entity';
import { Posts } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  AfterLoad,
  Column,
  createQueryBuilder,
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

  @ManyToOne(() => Forum, (f) => f.topics, { nullable: true })
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
  liked?: boolean;

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

  async userLikedThis(userId: string) {
    const query = createQueryBuilder('user_like_topic', 't').where(
      't.userId = :userId AND t.topicId = :topicId',
      { userId, topicId: this.id },
    );

    const result: any[] = await getConnection().query(query.getSql(), [
      userId,
      this.id,
    ]);

    this.liked = result.length > 0;
  }
}
