import { IsIBAN, IsNumber, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for creating a new bank account.
 */
export class CreateBankAccountDto {
  /**
   * The International Bank Account Number (IBAN) of the bank account.
   * @example "DE89370400440532013000"
   */
  @IsIBAN()
  IBAN: string;

  /**
   * The current balance of the bank account.
   * @example 1000.50
   */
  @IsNumber()
  currentBalance: number;

  /**
   * The unique identifier of the person who owns the bank account.
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsUUID()
  personId: string;
}
