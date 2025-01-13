import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionsController } from './bank-transactions.controller';
import { BankTransactionsService } from './bank-transactions.service';

describe('BankTransactionsController', () => {
  let controller: BankTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
