import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
var moment = require('moment');
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  private async send(
    to: string,
    subject: string,
    context: any,
    template: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async sendResetPassword(user: User, resetToken: string) {
    const url = `http://localhost:3000/auth/reset-password/${resetToken}`;
    const fullName = (user.firstName ?? '') + ' ' + (user.lastName ?? '');
    const context = {
      name: user.username,
      fullName,
      url,
    };
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'تغییر گذرواژه یک بار مصرف',
        template: './reset-password',
        context,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async sendCreateAccountConfimation(user: User, activeToken: string) {
    const url = `http://localhost:3000/auth/active-account/${activeToken}`;
    const context = {
      username: user.username,
      email: user.email,
      url,
    };
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'اهراز هویت',
        template: './confirmation',
        context,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async createNewAccount(user: User, password: string, resetToken: string) {
    const url = `http://localhost:3000/auth/reset-password/${resetToken}`;
    const context = {
      username: user.username,
      password,
      url,
    };
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'حساب کاربری جدید',
        template: './new-account',
        context,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async submitedContactUs(fullName: string, email: string) {
    const context = {
      fullName,
      creator: 'سجاد سیفی',
      email,
      username: fullName.replace(' ', ''),
      date: moment().format('MMMM Do YYYY'),
    };
    return this.send(email, 'نطرات و پیشنهادات', context, './contact-us.hbs');
  }
}
