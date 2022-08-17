import { CoreEntity } from 'src/common/entity/core.entity';
import { Topic } from 'src/topic/topic.entity';
import { User } from 'src/user/user.entity';
import { AfterLoad, Column, Entity, JoinTable, ManyToOne } from 'typeorm';

@Entity()
export class Posts extends CoreEntity {
  @Column()
  content: string;

  @ManyToOne(() => Topic, (t) => t.posts)
  @JoinTable()
  topic: Topic;

  @ManyToOne(() => User, (u) => u.posts)
  @JoinTable()
  user: User;

  edited?: boolean;
  @AfterLoad()
  isEditedPost() {
    this.edited = new Date(this.updateAt) > new Date(this.createAt);
  }
}
