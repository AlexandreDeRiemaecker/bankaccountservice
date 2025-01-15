import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';
import { BankTransactionDto } from './dto/bank-transaction.dto';
import { ApiResponse } from '@nestjs/swagger';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Controller('bank-transactions')
export class BankTransactionsController {
  private readonly logger = new Logger(BankTransactionsController.name);

  constructor(
    private readonly bankTransactionsService: BankTransactionsService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The bank transaction has been successfully created.',
    type: BankTransactionDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async create(
    @Body() createBankTransactionDto: CreateBankTransactionDto,
  ): Promise<BankTransactionDto> {
    try {
      return await this.bankTransactionsService.create(
        createBankTransactionDto,
      );
    } catch (error) {
      this.logger.error('Failed to create bank transaction', error.stack);
      throw new HttpException(
        { message: 'Failed to create bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved bank transactions.',
    type: [BankTransactionDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findAll(): Promise<BankTransactionDto[]> {
    try {
      return await this.bankTransactionsService.findAll();
    } catch (error) {
      this.logger.error('Failed to retrieve bank transactions', error.stack);
      throw new HttpException(
        { message: 'Failed to retrieve bank transactions', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':transactionId')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved bank transaction.',
    type: BankTransactionDto,
  })
  @ApiResponse({ status: 404, description: 'Bank transaction not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findOne(
    @Param('transactionId') transactionId: string,
  ): Promise<BankTransactionDto | null> {
    try {
      const transaction =
        await this.bankTransactionsService.findOne(transactionId);
      if (!transaction) {
        throw new NotFoundException(
          `Bank transaction with transactionId ${transactionId} not found`,
        );
      }
      return transaction;
    } catch (error) {
      this.logger.error('Failed to retrieve bank transaction', error.stack);
      throw new HttpException(
        {
          message: 'Failed to retrieve bank transaction',
          error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':transactionId')
  @ApiResponse({
    status: 200,
    description: 'The bank transaction has been successfully updated.',
    type: UpdateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Bank transaction not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async update(
    @Param('transactionId') transactionId: string,
    @Body() updateBankTransactionDto: UpdateBankTransactionDto,
  ): Promise<UpdateResponseDto> {
    try {
      return await this.bankTransactionsService.update(
        transactionId,
        updateBankTransactionDto,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update bank transaction with id ${transactionId}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to update bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':transactionId')
  @ApiResponse({
    status: 200,
    description: 'The bank transaction has been successfully deleted.',
    type: DeleteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Bank transaction not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async remove(
    @Param('transactionId') transactionId: string,
  ): Promise<DeleteResponseDto> {
    try {
      return await this.bankTransactionsService.remove(transactionId);
    } catch (error) {
      this.logger.error(
        `Failed to delete bank transaction with id ${transactionId}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to delete bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
