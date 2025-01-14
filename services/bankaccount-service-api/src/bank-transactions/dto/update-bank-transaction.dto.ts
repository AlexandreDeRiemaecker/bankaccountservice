import { PartialType } from '@nestjs/mapped-types';
import { CreateBankTransactionDto } from './create-bank-transaction.dto';

/**
 * Data Transfer Object for updating a bank transaction.
 * Extends the CreateBankTransactionDto with optional fields.
 */
export class UpdateBankTransactionDto extends PartialType(
  CreateBankTransactionDto,
) {}
