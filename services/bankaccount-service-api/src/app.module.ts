import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonsModule } from './persons/persons.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { BankTransactionsModule } from './bank-transactions/bank-transactions.module';
import { NeptuneService } from './shared/neptune/neptune.service';
import { SharedModule } from './shared/shared.module';
import { FriendshipsModule } from './friendships/friendships.module';

/* istanbul ignore file */
@Module({
  imports: [
    PersonsModule,
    BankAccountsModule,
    BankTransactionsModule,
    SharedModule,
    FriendshipsModule,
  ],
  controllers: [AppController],
  providers: [AppService, NeptuneService],
})
export class AppModule {}
