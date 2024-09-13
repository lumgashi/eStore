import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { generateEmailTemplate } from './functions/generateEmailTemplate';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { customResponse } from 'src/utils/functions/customResponse';

@Injectable()
export class EmailService {
  private resend;
  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get('resendApiKey'));
  }
  async sendEmail(from: string, to: string, subject: string, body: string) {
    try {
      const { data } = await this.resend.emails.send({
        from,
        to,
        subject,
        html: generateEmailTemplate({ body: body, imageUrl: '' }),
      });
      console.log('data:', data);
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Could not send email',
          error: error.message,
        }),
      );
    }
  }
}
