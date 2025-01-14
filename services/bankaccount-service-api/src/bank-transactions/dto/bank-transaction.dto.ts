import { IsIBAN, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BankTransaction {
  @ApiProperty({
    description:
      'The International Bank Account Number (IBAN) of the person receiving the transaction amount.',
  })
  @IsIBAN()
  otherPersonIBAN: string;

  @ApiProperty({
    description: 'The amount of the transaction.',
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
