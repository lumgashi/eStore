import * as bcrypt from 'bcryptjs';

/**
 * @description This function is using to create a hashed password
 * @param {String} password - Password which want to be hashed
 * @param {String} rounds - number of rounds that are used to create a hash or in another description as salt,default value is 10
 * @returns {Promise<String>} - return a hashed password
 */
export async function hashPassword(
  password: string,
  rounds?: number,
): Promise<string> {
  return await bcrypt.hash(password, rounds || 10);
}
