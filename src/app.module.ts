import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { HelperModule } from './helper/helper.module';
import { CategoryModule } from './category/category.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { UserService } from './user/user.service';
import { User } from './user/user.entity';
import { ForumModule } from './forum/forum.module';
import { TopicModule } from './topic/topic.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    JwtModule.forRoot({
      privateKey: 'pFGLCb3hclmW7h9ial2QNV9jfOzZ7194',
    }),
    UserModule,
    AuthModule,
    HelperModule,
    CategoryModule,
    TypeOrmModule.forFeature([User]),
    ForumModule,
    TopicModule,
    PostModule,
  ],
  controllers: [],

  providers: [AppService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.ALL,
    });
  }
}
