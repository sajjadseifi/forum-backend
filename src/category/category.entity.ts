import { CoreEntity } from 'src/common/entity/core.entity';
import { Forum } from 'src/forum/forum.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Category extends CoreEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  persianName: string;

  @ManyToOne(() => User, (u) => u.categories)
  @JoinColumn()
  user: User;

  @OneToMany(() => Forum, (f) => f.category)
  forums: Forum[];
}
