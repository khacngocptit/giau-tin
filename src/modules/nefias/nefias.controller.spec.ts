import { Test, TestingModule } from '@nestjs/testing';
import { NefiasController } from './nefias.controller';

describe('NefiasController', () => {
  let controller: NefiasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NefiasController],
    }).compile();

    controller = module.get<NefiasController>(NefiasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
