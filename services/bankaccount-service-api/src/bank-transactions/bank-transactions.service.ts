import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { BankTransactionDto } from './dto/bank-transaction.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Injectable()
export class BankTransactionsService {
  private readonly logger = new Logger(BankTransactionsService.name);

  constructor(private readonly neptuneService: NeptuneService) {}

  /**
   * Creates a new bank transaction.
   * @param createBankTransactionDto - Data transfer object for creating a bank transaction.
   * @returns The created bank transaction.
   * @throws NotFoundException if the bank account or other person's bank account is not found.
   * @throws BadRequestException if the transaction amount is invalid.
   */
  async create(
    createBankTransactionDto: CreateBankTransactionDto,
  ): Promise<BankTransactionDto> {
    try {
      this.validateAmount(createBankTransactionDto.amount);
      // Ensure the other person's bank account exists
      const recipientBankAccount =
        await this.neptuneService.findVertexByProperty(
          'BankAccount',
          'IBAN',
          createBankTransactionDto.otherPersonIBAN,
        );

      if (!recipientBankAccount) {
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
      const transaction = await this.neptuneService.addVertex(
        'BankTransaction',
        {
          transactionId: createBankTransactionDto.transactionId,
          bankAccountIBAN: createBankTransactionDto.bankAccountIBAN,
          otherPersonIBAN: createBankTransactionDto.otherPersonIBAN,
          amount: createBankTransactionDto.amount,
        },
      );

      // Link the transaction to the bank account
      await this.neptuneService.addEdge(
        'sent_transaction',
        bankAccount.id,
        transaction.id,
      );

      // Link the transaction to the other person's bank account
      await this.neptuneService.addEdge(
        'received_transaction',
        recipientBankAccount.id,
        transaction.id,
      );

      return transaction;
    } catch (error) {
      this.logger.error('Failed to create bank transaction', error.stack);
      throw error;
    }
  }

  /**
   * Retrieves all bank transactions.
   * @returns An array of bank transactions.
   */
  async findAll(): Promise<BankTransactionDto[]> {
    try {
      const transactions =
        await this.neptuneService.findVertices('BankTransaction');
      return transactions.map((transaction) => ({
        transactionId: transaction.transactionId,
        destinationIBAN: transaction.destinationIBAN,
        amount: transaction.amount,
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve bank transactions', error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a bank transaction by its transactionId.
   * @param transactionId - The transactionId of the bank transaction to retrieve.
   * @returns The bank transaction with the specified transactionId.
   * @throws NotFoundException if the bank transaction is not found.
   */
  async findOne(transactionId: string): Promise<BankTransactionDto> {
    try {
      const transaction = await this.neptuneService.findVertexByProperty(
        'BankTransaction',
        'transactionId',
        transactionId,
      );

      if (!transaction) {
        throw new NotFoundException('BankTransaction not found');
      }

      return transaction;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve bank transaction with id ${transactionId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates a bank transaction.
   * @param transactionId - The transactionId of the bank transaction to update.
   * @param updateBankTransactionDto - Data transfer object for updating a bank transaction.
   * @returns The response containing the updated vertex ID.
   * @throws BadRequestException if the request is malformed or the transaction amount is invalid.
   */
  async update(
    transactionId: string,
    updateBankTransactionDto: UpdateBankTransactionDto,
  ): Promise<UpdateResponseDto> {
    try {
      if (updateBankTransactionDto.amount === undefined) {
        throw new BadRequestException('Malformed request: amount is required');
      }

      this.validateAmount(updateBankTransactionDto.amount);

      const updatedVertexId = await this.neptuneService.updateVertex(
        'BankTransaction',
        'transactionId',
        transactionId,
        updateBankTransactionDto,
      );
      return { updatedVertexId };
    } catch (error) {
      this.logger.error(
        `Failed to update bank transaction with id ${transactionId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Deletes a bank transaction.
   * @param transactionId - The transactionId of the bank transaction to delete.
   * @returns The response containing the deleted vertex ID.
   */
  async remove(transactionId: string): Promise<DeleteResponseDto> {
    try {
      const deletedVertexId: string = await this.neptuneService.deleteVertex(
        'BankTransaction',
        'transactionId',
        transactionId,
      );

      if (!deletedVertexId) {
        throw new NotFoundException('BankTransaction not found');
      }

      return { deletedVertexId };
    } catch (error) {
      this.logger.error(
        `Failed to delete bank transaction with id ${transactionId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Validates the transaction amount.
   * @param amount - The amount to validate.
   * @throws BadRequestException if the transaction amount is not positive.
   */
  private validateAmount(amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Transaction amount must be positive');
    }
  }
}
