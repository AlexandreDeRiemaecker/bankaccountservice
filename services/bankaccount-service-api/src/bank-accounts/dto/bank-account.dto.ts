/**
 * Represents a bank account with its IBAN and current balance.
 */
import { ApiProperty } from '@nestjs/swagger';

export class BankAccount {
  @ApiProperty({
    description:
      'The International Bank Account Number (IBAN) of the bank account.',
  })
  IBAN: string;

  @ApiProperty({ description: 'The current balance of the bank account.' })
  currentBalance: number;
}
