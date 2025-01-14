import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { BankAccount } from './dto/bank-account.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';

/**
 * Service for managing bank accounts.
 */
@Injectable()
export class BankAccountsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  /**
   * Creates a new bank account.
   * @param createBankAccountDto - Data Transfer Object for creating a new bank account.
   * @returns The created bank account.
   * @throws ConflictException if a bank account with the same IBAN already exists.
   * @throws NotFoundException if the person associated with the bank account is not found.
   */
  async create(
    createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const existingAccount = await this.neptuneService.findVertexByProperty(
      'BankAccount',
      'IBAN',
      createBankAccountDto.IBAN,
    );

    if (existingAccount) {
      throw new ConflictException('BankAccount with this IBAN already exists');
    }

    const person = await this.neptuneService.findVertexByProperty(
      'Person',
      'personId',
      createBankAccountDto.personId,
    );

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const bankAccount = await this.neptuneService.addVertex('BankAccount', {
      IBAN: createBankAccountDto.IBAN,
      currentBalance: createBankAccountDto.currentBalance,
    });

    await this.neptuneService.addEdge(
      'owns_account',
      person.id,
      bankAccount.id,
    );

    return bankAccount;
  }

  /**
   * Retrieves all bank accounts.
   * @returns An array of bank accounts.
   */
  async findAll(): Promise<BankAccount[]> {
    return await this.neptuneService.findVertices('BankAccount');
  }

  /**
   * Retrieves a bank account by its IBAN.
   * @param id - The IBAN of the bank account.
   * @returns The bank account.
   * @throws NotFoundException if the bank account is not found.
   */
  async findOne(id: string): Promise<BankAccount> {
    const bankAccount = await this.neptuneService.findVertexByProperty(
      'BankAccount',
      'IBAN',
      id,
    );

    if (!bankAccount) {
      throw new NotFoundException('BankAccount not found');
    }

    return bankAccount;
  }

  /**
   * Updates a bank account.
   * @param id - The IBAN of the bank account to update.
   * @param updateBankAccountDto - Data Transfer Object for updating the bank account.
   * @returns The response containing the updated vertex ID.
   */
  async update(
    id: string,
    updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<UpdateResponseDto> {
    const updatedVertexId = await this.neptuneService.updateVertex(
      'BankAccount',
      'IBAN',
      id,
      updateBankAccountDto,
    );
    return { updatedVertexId };
  }

  /**
   * Deletes a bank account.
   * @param IBAN - The IBAN of the bank account to delete.
   * @returns The response containing the deleted vertex ID.
   */
  async remove(IBAN: string): Promise<DeleteResponseDto> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'BankAccount',
      'IBAN',
      IBAN,
    );
    return { deletedVertexId };
  }
}
