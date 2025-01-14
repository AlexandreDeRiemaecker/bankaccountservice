import { Injectable } from '@nestjs/common';
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

    const result = await this.neptuneService.addVertex('BankAccount', {
      IBAN: createBankAccountDto.IBAN,
      currentBalance: createBankAccountDto.currentBalance,
    });
    return result;
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

  async remove(id: string): Promise<DeleteResponseDto> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'BankAccount',
      'IBAN',
      id,
    );
    return { deletedVertexId };
  }
}
