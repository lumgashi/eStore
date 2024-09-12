import * as bcrypt from 'bcryptjs';

import { BadRequestException, HttpStatus } from '@nestjs/common';
import { customResponse } from './customResponse';

/**
 * @description This fuction is using to match two different passwords
 * @param {String} password - Is the password that user sent from the body
 * @param {String} userPassword - Is the password of current user, or user that get from db
 * @returns {Promise<Boolean>} - return a true|false statement
 */
export async function matchPasswords(
  password: string,
  userPassword: string,
): Promise<boolean | BadRequestException> {
  const check = await bcrypt.compare(password, userPassword);
  if (check) {
    return true;
  }
  throw new BadRequestException(
    customResponse({
      code: HttpStatus.BAD_REQUEST,
      status: false,
      error: 'Invalid password or email!',
      message: 'Invalid password or email!',
    }),
  );
}
