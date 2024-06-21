import { Column, Entity, getRepository, PrimaryColumn } from 'typeorm';

export enum LikePostStatus {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}
@Entity()
export class LikePost {
  @PrimaryColumn('uuid')
  postId: string;

  @PrimaryColumn('uuid')
  userId: string;
  @Column()
  status: LikePostStatus;

  async likeCounts(postId: string) {
    return await getRepository(LikePost).count({
      where: {
        postId,
        status: LikePostStatus.LIKE,
      },
    });
  }

  async disLikeCounts(postId: string) {
    return await getRepository(LikePost).count({
      where: {
        postId,
        status: LikePostStatus.DISLIKE,
      },
    });
  }
}
export const disLikCounts = async (postId: string) => {
  return await getRepository(LikePost).count({
    where: {
      postId,
      status: LikePostStatus.DISLIKE,
    },
  });
};
export const likeCounts = async (postId: string) => {
  return await getRepository(LikePost).count({
    where: {
      postId,
      status: LikePostStatus.LIKE,
    },
  });
};

export const userlikePostCounts = async (
  userId: string,
  status: LikePostStatus,
) => {
  return await getRepository(LikePost).count({
    where: { userId, status },
  });
};
