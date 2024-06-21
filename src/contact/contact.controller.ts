import { Body, Controller, Post } from '@nestjs/common';
import { NewContactUsDto } from 'src/contact/dto/new-contact-us.dto';
import { IpAddress } from 'src/common/decorator/ip-address.decorator';
import { ContactService } from './contact.service';
import { MailService } from 'src/mail/mail.service';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly ContactService: ContactService,
    private readonly mailService: MailService,
  ) {}
  @Post('/contact-us')
  async contactUs(
    @IpAddress() IpAddress: string,
    @Body() newContactUsDto: NewContactUsDto,
  ) {
    const submited = await this.ContactService.createNewAdvice(
      IpAddress,
      newContactUsDto,
    );

    //send mail
    if (submited) {
      const { email, fullName } = newContactUsDto;
      await this.mailService.submitedContactUs(fullName, email);
    }

    return {
      ok: submited,
    };
  }
}
