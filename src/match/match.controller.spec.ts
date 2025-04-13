import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { UserService } from '../user/user.service';
import { MatchService } from './match.service';

describe('MatchController', () => {
  let controller: MatchController;
  let userService: UserService
  let matchService: MatchService

  const mockUserService = {
    
  }

  const mockMatchService = {
    
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: MatchService,
          useValue: mockMatchService
        }
      ]
    }).compile();

    controller = module.get<MatchController>(MatchController);
    userService = module.get<UserService>(UserService);
    matchService = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
