import { Test, TestingModule } from '@nestjs/testing';
import { RotationsController } from './rotations.controller';

describe('RotationsController', () => {
  let controller: RotationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RotationsController],
    }).compile();

    controller = module.get<RotationsController>(RotationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
