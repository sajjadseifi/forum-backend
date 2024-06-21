import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from './entity/mail.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mail, User])],
  providers: [InboxService],
  controllers: [InboxController],
})
export class InboxModule {}
