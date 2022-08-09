import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { HelperModule } from './helper/helper.module';
import { CategoryModule } from './category/category.module';

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
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
