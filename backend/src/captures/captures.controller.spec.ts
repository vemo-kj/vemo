import { Test, TestingModule } from '@nestjs/testing';
import { CapturesController } from './captures.controller';

describe('CapturesController', () => {
  let controller: CapturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CapturesController],
    }).compile();

    controller = module.get<CapturesController>(CapturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
