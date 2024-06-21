import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { SendMailBaseDto } from './dto/send-mail.dto';
import { Mail } from './entity/mail.entity';

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Mail) private readonly mailRepository: Repository<Mail>,
    @InjectRepository(User) private readonly userRepistory: Repository<User>,
  ) {}

  async createMessages(
    sender: User,
    recivers: User[],
    sendMailDtoBase: SendMailBaseDto,
  ) {
    return recivers.map((reciever) =>
      this.mailRepository.create({
        sender,
        reciever,
        ...sendMailDtoBase,
      }),
    );
  }
  async getRecivers() {}
  async send(
    sender: User,
    reciversId: string[],
    sendBaseMailDto: SendMailBaseDto,
  ) {
    const recivers = await this.userRepistory.findByIds(reciversId);

    const messages = await this.createMessages(
      sender,
      recivers,
      sendBaseMailDto,
    );
    const savedMessages = await this.mailRepository.save(messages);
    return savedMessages;
  }
}
