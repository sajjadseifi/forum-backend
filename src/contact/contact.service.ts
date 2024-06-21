import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewContactUsDto } from 'src/contact/dto/new-contact-us.dto';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}
  async createNewAdvice(ipAddress: string, newContactUsDto: NewContactUsDto) {
    const contact = this.contactRepository.create({
      ipAddress,
      ...newContactUsDto,
    });
    try {
      await this.contactRepository.save(contact);
      return true;
    } catch (error) {
      return false;
    }
  }
}
