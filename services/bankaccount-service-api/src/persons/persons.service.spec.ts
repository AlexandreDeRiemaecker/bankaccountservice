import { Test, TestingModule } from '@nestjs/testing';
import { PersonsService } from './persons.service';
import { SharedModule } from '../shared/shared.module';

describe('PersonsService', () => {
  let service: PersonsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [PersonsService],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
