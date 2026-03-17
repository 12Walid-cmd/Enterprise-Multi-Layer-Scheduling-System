import { Test, TestingModule } from '@nestjs/testing';
import { ConflictsService } from './conflicts.service';

describe('ConflictsService', () => {
  let service: ConflictsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConflictsService],
    }).compile();

    service = module.get<ConflictsService>(ConflictsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
