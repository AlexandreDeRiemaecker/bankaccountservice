import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { BankAccount } from './dto/bank-account.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  async create(
    createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const existingAccount = await this.neptuneService.findVertexByProperty(
      'BankAccount',
      'IBAN',
      createBankAccountDto.IBAN,
    );

    if (existingAccount) {
      throw new Error('BankAccount with this IBAN already exists');
    }

    // Ensure the person exists
    const person = await this.neptuneService.findVertexByProperty(
      'Person',
      'personId',
      createBankAccountDto.personId,
    );

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Create the bank account vertex
    const bankAccount = await this.neptuneService.addVertex('BankAccount', {
      IBAN: createBankAccountDto.IBAN,
      currentBalance: createBankAccountDto.currentBalance,
    });

    // Link the bank account to the person
    await this.neptuneService.addEdge(
      'owns_account',
      person.id,
      bankAccount.id,
    );

    return bankAccount;
  }

  async findAll(): Promise<BankAccount[]> {
    return await this.neptuneService.findVertices('BankAccount');
  }

  async findOne(id: string): Promise<BankAccount> {
    const bankAccount = await this.neptuneService.findVertexByProperty(
      'BankAccount',
      'IBAN',
      id,
    );

    if (!bankAccount) {
      throw new Error('BankAccount not found');
    }

    return bankAccount;
  }

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

  async remove(IBAN: string): Promise<DeleteResponseDto> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'BankAccount',
      'IBAN',
      IBAN,
    );
    return { deletedVertexId };
  }
}
