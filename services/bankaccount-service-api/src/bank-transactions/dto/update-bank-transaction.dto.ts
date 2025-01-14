import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIBAN, IsNumber, IsOptional, IsPositive } from 'class-validator';

/**
 * Data Transfer Object for updating a bank transaction.
 */
export class UpdateBankTransactionDto {
  /**
   * The IBAN of the bank account initiating the transaction.
   * @type {string}
   * @optional
   */
  @IsIBAN()
  bankAccountIBAN: string;

  /**
   * The IBAN of the other person's bank account involved in the transaction.
   * @type {string}
   * @optional
   */
  @IsIBAN()
  otherPersonIBAN: string;

  /**
   * The amount of money to be transferred in the transaction.
   * Must be a positive number.
   * @type {number}
   * @optional
   */
  @IsNumber()
  @IsPositive()
  @ApiPropertyOptional()
  @IsOptional()
  amount?: number;
}
