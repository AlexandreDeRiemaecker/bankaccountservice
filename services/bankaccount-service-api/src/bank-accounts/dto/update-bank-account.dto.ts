import { PartialType } from '@nestjs/mapped-types';
import { CreateBankAccountDto } from './create-bank-account.dto';

/**
 * Data Transfer Object (DTO) for updating a bank account.
 * This class extends the PartialType of CreateBankAccountDto,
 * making all properties of CreateBankAccountDto optional.
 *
 * @extends PartialType(CreateBankAccountDto)
 */
export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}
