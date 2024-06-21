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
import { UserRole } from './user/entity/user-role.entity';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
// import { InboxModule } from './inbox/inbox.module';
import { InboxModule } from './inbox/inbox.module';
import { ContactModule } from './contact/contact.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    JwtModule.forRoot({
      privateKey: process.env.JWT_PRIVATEKEY,
    }),
    UserModule,
    AuthModule,
    HelperModule,
    CategoryModule,
    TypeOrmModule.forFeature([User, UserRole]),
    ForumModule,
    TopicModule,
    PostModule,
    MailModule,
    InboxModule,
    ContactModule,
    // InboxModule,
  ],
  controllers: [],

  providers: [AppService, UserService],
})
export class AppModule {
  constructor(private readonly userService: UserService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.ALL,
    });
  }
  onModuleInit() {
    this.userService.createRootAdmin();
  }
}
