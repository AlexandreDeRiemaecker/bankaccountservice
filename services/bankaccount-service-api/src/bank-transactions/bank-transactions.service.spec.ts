import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionsService } from './bank-transactions.service';
import { SharedModule } from '../shared/shared.module';

describe('BankTransactionsService', () => {
  let service: BankTransactionsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [BankTransactionsService],
    }).compile();

    service = module.get<BankTransactionsService>(BankTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
