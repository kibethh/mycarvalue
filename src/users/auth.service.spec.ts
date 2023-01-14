import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

let service: AuthService;

describe('AuthService', () => {
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    // Create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of a auth service', async () => {
    expect(service).toBeDefined();
  });
  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('kibet@gmail.com', '12345');
    expect(user.password).not.toEqual('12345');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('throws an error if user signs up with an email already in use', async () => {
    await service.signup('kibet@gmail.com', '12345');
    await expect(service.signup('kibet@gmail.com', '12345')).rejects.toThrow();
  });
  it('throws if signed in with an unused email', async () => {
    await expect(service.signin('kibet@gmail.com', '12345')).rejects.toThrow();
  });
  it('throws if an invalid password is provided', async () => {
    await service.signup('kibet@gmail.com', '12345');
    await expect(service.signin('kibet@gmail.com', '123456')).rejects.toThrow();
  });
  it('returns a user if a correct password is provided', async () => {
    await service.signup('kibet@gmail.com', '12345');
    const user = await service.signin('kibet@gmail.com', '12345');
    expect(user).toBeDefined();
  });
});
