import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from 'src/helper/helper.service';
import { MailService } from 'src/mail/mail.service';
import { UserRole } from 'src/user/entity/user-role.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthGard } from './auth.gard';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  controllers: [AuthController],
  providers: [
    MailService,
    AuthService,
    HelperService,
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGard,
    },
  ],
})
export class AuthModule {}
