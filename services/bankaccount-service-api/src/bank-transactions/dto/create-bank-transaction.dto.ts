import { IsIBAN, IsNumber, IsPositive } from 'class-validator';

/**
 * Data Transfer Object for creating a bank transaction.
 */
export class CreateBankTransactionDto {
  /**
   * The IBAN of the bank account initiating the transaction.
   * @type {string}
   */
  @IsIBAN()
  bankAccountIBAN: string;

  /**
   * The IBAN of the other person's bank account involved in the transaction.
   * @type {string}
   */
  @IsIBAN()
  otherPersonIBAN: string;

  /**
   * The amount of money to be transferred in the transaction.
   * Must be a positive number.
   * @type {number}
   */
  @IsNumber()
  @IsPositive()
  amount: number;
}
