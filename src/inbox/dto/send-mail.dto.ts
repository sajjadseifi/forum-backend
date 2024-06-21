import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray } from 'class-validator';
import { ObjectID } from 'typeorm';
import { Mail } from '../entity/mail.entity';

export class SendMailBaseDto extends PickType(Mail, [
  'subject',
  'content',
  'isHtmlContnet',
  'replyId',
]) {}

export class SendMailDto extends SendMailBaseDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => ObjectID)
  recivers: string[];
}
