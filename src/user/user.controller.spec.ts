import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CustomJwtModule } from '../jwt/jwt.module';
import { UserModule } from './user.module';
import { GenreModule } from '../genre/genre.module';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [CustomJwtModule, UserModule, GenreModule],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
