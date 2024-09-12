import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { generateEmailTemplate } from './functions/generateEmailTemplate';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}
  async sendEmail(from: string, to: string, subject: string, body: string) {
    return this.mailerService.sendMail({
      from,
      to,
      subject,
      html: generateEmailTemplate({ body: body, imageUrl: '' }),
    });
  }
}
