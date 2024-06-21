import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Category } from './category/category.entity';
import { Contact } from './contact/contact.entity';
import { Forum } from './forum/forum.entity';
import { Mail } from './inbox/entity/mail.entity';
import { LikePost } from './post/like-post.entity';
import { Posts } from './post/post.entity';
import { Topic } from './topic/topic.entity';
import { UserRole } from './user/entity/user-role.entity';
import { User } from './user/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1204',
  database: 'forum',
  entities: [
    User,
    Category,
    Forum,
    Topic,
    Posts,
    UserRole,
    LikePost,
    Mail,
    Contact,
  ],
  synchronize: true,
};
