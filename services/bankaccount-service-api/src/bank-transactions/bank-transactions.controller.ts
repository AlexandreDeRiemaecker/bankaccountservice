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
} from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';

@Controller('bank-transactions')
export class BankTransactionsController {
  constructor(
    private readonly bankTransactionsService: BankTransactionsService,
  ) {}

  @Post()
  async create(@Body() createBankTransactionDto: CreateBankTransactionDto) {
    try {
      return await this.bankTransactionsService.create(
        createBankTransactionDto,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.bankTransactionsService.findAll();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to retrieve bank transactions', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.bankTransactionsService.findOne(id);
    } catch (error) {
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
  async update(
    @Param('id') id: string,
    @Body() updateBankTransactionDto: UpdateBankTransactionDto,
  ) {
    try {
      return await this.bankTransactionsService.update(
        id,
        updateBankTransactionDto,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.bankTransactionsService.remove(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete bank transaction', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
