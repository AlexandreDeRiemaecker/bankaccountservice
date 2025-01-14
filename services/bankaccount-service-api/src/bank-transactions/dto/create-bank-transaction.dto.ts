import { IsIBAN, IsNumber, IsPositive } from 'class-validator';

export class CreateBankTransactionDto {
  @IsIBAN()
  bankAccountIBAN: string;

  @IsIBAN()
  otherPersonIBAN: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
