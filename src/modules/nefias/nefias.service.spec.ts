import { Test, TestingModule } from '@nestjs/testing';
import { NefiasService } from './nefias.service';

describe('NefiasService', () => {
  let service: NefiasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NefiasService],
    }).compile();

    service = module.get<NefiasService>(NefiasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
