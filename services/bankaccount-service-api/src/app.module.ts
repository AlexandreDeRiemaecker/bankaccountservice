import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonsModule } from './persons/persons.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { BankTransactionsModule } from './bank-transactions/bank-transactions.module';
import { NeptuneService } from './shared/neptune/neptune.service';
import { SharedModule } from './shared/shared.module';

/* istanbul ignore file */
@Module({
  imports: [
    PersonsModule,
    BankAccountsModule,
    BankTransactionsModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService, NeptuneService],
})
export class AppModule {}
