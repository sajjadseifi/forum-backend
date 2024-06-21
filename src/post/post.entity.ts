import { IsBoolean, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Topic } from 'src/topic/topic.entity';
import { User } from 'src/user/user.entity';
import {
  AfterLoad,
  Column,
  Entity,
  getRepository,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import {
  disLikCounts,
  likeCounts,
  LikePost,
  LikePostStatus,
} from './like-post.entity';

@Entity()
export class Posts extends CoreEntity {
  @Column()
  content: string;

  @Column({ insert: false, default: false })
  accepted?: boolean;

  @ManyToOne(() => Topic, (t) => t.posts)
  @JoinTable()
  topic: Topic;

  @ManyToOne(() => User, (u) => u.posts)
  @JoinTable()
  user: User;

  edited?: boolean;
  likeCounts?: number;
  dislikeCounts?: number;
  likedStatus?: LikePostStatus;
  @AfterLoad()
  isEditedPost() {
    this.edited = new Date(this.updateAt) > new Date(this.createAt);
  }

  @AfterLoad()
  async likePostCounts() {
    this.likeCounts = await likeCounts(this.id);
    this.dislikeCounts = await disLikCounts(this.id);
  }
  @AfterLoad()
  async userLikedPost(userId: string) {
    const likedUser = await getRepository(LikePost).findOne({
      where: {
        postId: this.id,
        userId,
      },
    });
    if (likedUser) this.likedStatus = likedUser.status;
  }
}
