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
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  async create(@Body() createBankAccountDto: CreateBankAccountDto) {
    try {
      return await this.bankAccountsService.create(createBankAccountDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.bankAccountsService.findAll();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to retrieve bank accounts', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.bankAccountsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Failed to retrieve bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    try {
      return await this.bankAccountsService.update(id, updateBankAccountDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.bankAccountsService.remove(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
