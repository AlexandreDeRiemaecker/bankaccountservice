import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIBAN, IsNumber, IsOptional, IsUUID } from 'class-validator';

/**
 * Data Transfer Object (DTO) for updating a bank account.
 */
export class UpdateBankAccountDto {
  /**
   * The International Bank Account Number (IBAN) of the bank account.
   * @optional
   */
  @IsIBAN()
  @ApiPropertyOptional()
  @IsOptional()
  IBAN?: string;

  /**
   * The current balance of the bank account.
   * @optional
   */
  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional()
  currentBalance?: number;

  /**
   * The unique identifier of the person who owns the bank account.
   * @optional
   */
  @IsUUID()
  @ApiPropertyOptional()
  @IsOptional()
  personId?: string;
}
