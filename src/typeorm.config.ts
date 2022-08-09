import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Category } from './category/category.entity';
import { User } from './user/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1204',
  database: 'forum',
  entities: [User, Category],
  synchronize: true,
};
