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
} from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';
import { BankTransaction } from './entities/bank-transaction.entity';
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
    type: BankTransaction,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async create(
    @Body() createBankTransactionDto: CreateBankTransactionDto,
  ): Promise<BankTransaction> {
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
    type: [BankTransaction],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findAll(): Promise<BankTransaction[]> {
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

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved bank transaction.',
    type: BankTransaction,
  })
  @ApiResponse({ status: 404, description: 'Bank transaction not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findOne(@Param('id') id: string): Promise<BankTransaction> {
    try {
      return await this.bankTransactionsService.findOne(id);
    } catch (error) {
      this.logger.error('Failed to retrieve bank transaction', error.stack);
      throw new HttpException(
        {
          message: error.message || 'Failed to retrieve bank transaction',
          error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
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
    @Param('id') id: string,
    @Body() updateBankTransactionDto: UpdateBankTransactionDto,
  ): Promise<UpdateResponseDto> {
    try {
      return await this.bankTransactionsService.update(
        id,
        updateBankTransactionDto,
      );
    } catch (error) {
      this.logger.error('Failed to update bank transaction', error.stack);
      throw new HttpException(
        { message: 'Failed to update bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
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
  async remove(@Param('id') id: string): Promise<DeleteResponseDto> {
    try {
      return await this.bankTransactionsService.remove(id);
    } catch (error) {
      this.logger.error('Failed to delete bank transaction', error.stack);
      throw new HttpException(
        { message: 'Failed to delete bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
