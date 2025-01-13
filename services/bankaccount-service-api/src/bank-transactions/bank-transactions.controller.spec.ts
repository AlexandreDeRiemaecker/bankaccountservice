import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionsController } from './bank-transactions.controller';
import { BankTransactionsService } from './bank-transactions.service';
import { SharedModule } from '../shared/shared.module';

describe('BankTransactionsController', () => {
  let controller: BankTransactionsController;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [BankTransactionsController],
      providers: [BankTransactionsService],
    }).compile();

    controller = module.get<BankTransactionsController>(
      BankTransactionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
