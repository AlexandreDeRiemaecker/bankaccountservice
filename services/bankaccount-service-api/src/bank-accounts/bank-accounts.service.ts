import { Injectable } from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';

@Injectable()
export class BankAccountsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  async create(createBankAccountDto: CreateBankAccountDto) {
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

  async findAll() {
    return await this.neptuneService.findVertices('BankAccount');
  }

  async findOne(id: string) {
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

  async update(id: string, updateBankAccountDto: UpdateBankAccountDto) {
    const updatedVertexId = await this.neptuneService.updateVertex(
      'BankAccount',
      'IBAN',
      id,
      updateBankAccountDto,
    );
    return { updatedVertexId };
  }

  async remove(id: string): Promise<{ deletedVertexId: string }> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'BankAccount',
      'IBAN',
      id,
    );
    return { deletedVertexId };
  }
}
