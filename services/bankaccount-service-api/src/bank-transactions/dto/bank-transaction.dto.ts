import { IsIBAN, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents a bank transaction.
 */
export class BankTransaction {
  /**
   * The International Bank Account Number (IBAN) of the person receiving the transaction amount.
   */
  @ApiProperty({
    description:
      'The International Bank Account Number (IBAN) of the person receiving the transaction amount.',
  })
  @IsIBAN()
  otherPersonIBAN: string;

  /**
   * The amount of the transaction.
   */
  @ApiProperty({
    description: 'The amount of the transaction.',
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
