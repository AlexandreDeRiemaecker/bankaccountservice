import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { randomUUID } from 'crypto';
import { BankTransaction } from './dto/bank-transaction.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Injectable()
export class BankTransactionsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  async create(
    createBankTransactionDto: CreateBankTransactionDto,
  ): Promise<BankTransaction> {
    this.validateAmount(createBankTransactionDto.amount);
    // Ensure the other person's bank account exists
    const otherPersonBankAccount =
      await this.neptuneService.findVertexByProperty(
        'BankAccount',
        'IBAN',
        createBankTransactionDto.otherPersonIBAN,
      );

    if (!otherPersonBankAccount) {
      throw new NotFoundException('Other person BankAccount not found');
    }
    // Ensure the bank account exists
    const bankAccount = await this.neptuneService.findVertexByProperty(
      'BankAccount',
      'IBAN',
      createBankTransactionDto.bankAccountIBAN,
    );

    if (!bankAccount) {
      throw new NotFoundException('BankAccount not found');
    }

    // Create the transaction vertex
    const transaction = await this.neptuneService.addVertex('BankTransaction', {
      transactionId: randomUUID(),
      bankAccountIBAN: createBankTransactionDto.bankAccountIBAN,
      otherPersonIBAN: createBankTransactionDto.otherPersonIBAN,
      amount: createBankTransactionDto.amount,
    });

    // Link the transaction to the bank account
    await this.neptuneService.addEdge(
      'has_transaction',
      bankAccount.id,
      transaction.id,
    );

    // Link the transaction to the other person's bank account
    await this.neptuneService.addEdge(
      'involves_transaction',
      otherPersonBankAccount.id,
      transaction.id,
    );

    return transaction;
  }

  async findAll(): Promise<BankTransaction[]> {
    const transactions =
      await this.neptuneService.findVertices('BankTransaction');
    return transactions.map((transaction) => ({
      id: transaction.id,
      otherPersonIBAN: transaction.otherPersonIBAN,
      amount: transaction.amount,
    }));
  }

  async findOne(transactionId: string): Promise<BankTransaction> {
    const transaction = await this.neptuneService.findVertexByProperty(
      'BankTransaction',
      'transactionId',
      transactionId,
    );

    if (!transaction) {
      throw new NotFoundException('BankTransaction not found');
    }

    return transaction;
  }

  async update(
    id: string,
    updateBankTransactionDto: UpdateBankTransactionDto,
  ): Promise<UpdateResponseDto> {
    if (updateBankTransactionDto.amount === undefined) {
      throw new BadRequestException('Malformed request: amount is required');
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

  async remove(id: string): Promise<DeleteResponseDto> {
    const deletedVertexId: string = await this.neptuneService.deleteVertex(
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
