import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

// Mock the Resend library
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({ data: 'Email sent!' }),
      },
    })),
  };
});

describe('EmailService', () => {
  let service: EmailService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('re_123'), // Mock the API key
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email successfully', async () => {
    const { data } = await service.sendEmail(
      'Acme <onboarding@resend.dev>',
      'lumgash04@gmail.com',
      'Test Subject',
      'Test Body',
    );
    expect(typeof data).toBe('string');
    expect(data).toEqual('Email sent!');
    //data: { id: '8276c749-abf6-475a-97c1-5fdce8581db1' }
  });

  it('should throw error if email sending fails', async () => {
    jest
      .spyOn(service['resend'].emails, 'send')
      .mockRejectedValueOnce(new Error('Failed to send email'));

    await expect(
      service.sendEmail(
        'test@example.com',
        'recipient@example.com',
        'Test Subject',
        'Test Body',
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
