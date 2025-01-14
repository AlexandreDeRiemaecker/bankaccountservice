import { IsNumber, IsIBAN, IsUUID } from 'class-validator';

export class CreateBankAccountDto {
  @IsIBAN()
  IBAN: string;

  @IsNumber()
  currentBalance: number;

  @IsUUID()
  personId: string;
}
