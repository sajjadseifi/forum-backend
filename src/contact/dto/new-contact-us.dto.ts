import { PickType } from '@nestjs/mapped-types';
import { Contact } from 'src/contact/contact.entity';

export class NewContactUsDto extends PickType(Contact, [
  'fullName',
  'email',
  'content',
]) {}
