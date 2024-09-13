import { Controller } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  async sendEmail(from: string, to: string, subject: string, html: string) {
    return await this.emailService.sendEmail(from, to, subject, html);
  }
}
