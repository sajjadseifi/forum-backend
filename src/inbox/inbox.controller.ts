import { Body, Controller, Post } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth.decorator';
import { User } from 'src/user/user.entity';
import { SendMailBaseDto, SendMailDto } from './dto/send-mail.dto';
import { InboxService } from './inbox.service';
import _ from 'lodash';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Post()
  createNewMessage(@AuthUser() user: User, @Body() sendMailDto: SendMailDto) {
    const reciversId = sendMailDto.recivers;
    // const baseMail: SendMailBaseDto = _.omit(sendMailDto, 'recivers');

    return this.inboxService.send(user, reciversId, {
      subject: sendMailDto.subject,
      content: sendMailDto.content,
      isHtmlContnet: sendMailDto.isHtmlContnet,
      replyId: sendMailDto.replyId,
    });
  }
}
