import { IsNumber, IsIBAN } from 'class-validator';

export class CreateBankAccountDto {
  @IsIBAN()
  IBAN: string;

  @IsNumber()
  currentBalance: number;
}
