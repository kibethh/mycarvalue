import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use!');
    }
    // Generate salt
    const salt = randomBytes(8).toString('hex');
    // hash the password
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Join hash and salt
    const result = salt + '.' + hash.toString('hex');
    // create a user and save it
    const user = await this.usersService.create(email, result);
    // return the user
    return user;
  }
  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Wrong Password!');
    }
    return user;
  }
}
