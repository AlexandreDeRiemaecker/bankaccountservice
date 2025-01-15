import { Module } from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { BankTransactionsController } from './bank-transactions.controller';

/* istanbul ignore file */
@Module({
  controllers: [BankTransactionsController],
  providers: [BankTransactionsService],
})
export class BankTransactionsModule {}
