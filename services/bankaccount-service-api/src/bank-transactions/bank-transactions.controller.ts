import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';

@Controller('bank-transactions')
export class BankTransactionsController {
  constructor(private readonly bankTransactionsService: BankTransactionsService) {}

  @Post()
  create(@Body() createBankTransactionDto: CreateBankTransactionDto) {
    return this.bankTransactionsService.create(createBankTransactionDto);
  }

  @Get()
  findAll() {
    return this.bankTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankTransactionDto: UpdateBankTransactionDto) {
    return this.bankTransactionsService.update(+id, updateBankTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankTransactionsService.remove(+id);
  }
}
