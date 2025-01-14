import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { randomUUID } from 'crypto';

@Injectable()
export class BankTransactionsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  async create(createBankTransactionDto: CreateBankTransactionDto) {
    this.validateAmount(createBankTransactionDto.amount);

    const result = await this.neptuneService.addVertex('BankTransaction', {
      transactionId: randomUUID(),
      otherPersonIBAN: createBankTransactionDto.otherPersonIBAN,
      amount: createBankTransactionDto.amount,
    });
    return result;
  }

  async findAll() {
    return await this.neptuneService.findVertices('BankTransaction');
  }

  async findOne(transactionId: string) {
    const transaction = await this.neptuneService.findVertexByProperty(
      'BankTransaction',
      'transactionId',
      transactionId,
    );

    if (!transaction) {
      throw new Error('BankTransaction not found');
    }

    return transaction;
  }

  async update(id: string, updateBankTransactionDto: UpdateBankTransactionDto) {
    if (updateBankTransactionDto.amount === undefined) {
      throw new Error('Malformed request: amount is required');
    }

    this.validateAmount(updateBankTransactionDto.amount);

    const updatedVertexId = await this.neptuneService.updateVertex(
      'BankTransaction',
      'transactionId',
      id,
      updateBankTransactionDto,
    );
    return { updatedVertexId };
  }

  async remove(id: string): Promise<{ deletedVertexId: string }> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'BankTransaction',
      'transactionId',
      id,
    );
    return { deletedVertexId };
  }

  private validateAmount(amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Transaction amount must be positive');
    }
  }
}
