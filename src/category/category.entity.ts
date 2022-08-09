import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Category extends CoreEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  persianName: string;

  @ManyToOne(() => User, (u) => u.categories)
  user: User;
}
