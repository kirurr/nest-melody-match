import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { UserModule } from '../user/user.module';
import { MatchModule } from './match.module';

describe('MatchController', () => {
  let controller: MatchController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      imports: [UserModule, MatchModule]
    }).compile();

    controller = module.get<MatchController>(MatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
