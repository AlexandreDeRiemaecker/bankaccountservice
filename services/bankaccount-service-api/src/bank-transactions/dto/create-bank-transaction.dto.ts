import { IsIBAN, IsNumber, IsPositive } from 'class-validator';

export class CreateBankTransactionDto {
  @IsIBAN()
  otherPersonIBAN: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
