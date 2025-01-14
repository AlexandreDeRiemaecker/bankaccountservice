import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountDto } from './dto/bank-account.dto';
import { UpdateResponseDto } from '../bank-accounts/dto/update-response.dto';
import { DeleteResponseDto } from '../bank-accounts/dto/delete-response.dto';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  private readonly logger = new Logger(BankAccountsController.name);

  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiResponse({
    type: BankAccountDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The bank account has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  @ApiResponse({
    status: 409,
    description: 'BankAccount with this IBAN already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async create(
    @Body() createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccountDto> {
    try {
      return await this.bankAccountsService.create(createBankAccountDto);
    } catch (error) {
      this.logger.error('Failed to create bank account', error.stack);
      throw new HttpException(
        { message: 'Failed to create bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [BankAccountDto],
    description: 'Successfully retrieved bank accounts.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findAll(): Promise<BankAccountDto[]> {
    try {
      return await this.bankAccountsService.findAll();
    } catch (error) {
      this.logger.error('Failed to retrieve bank accounts', error.stack);
      throw new HttpException(
        { message: 'Failed to retrieve bank accounts', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: BankAccountDto,
    description: 'Successfully retrieved bank account.',
  })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findOne(@Param('id') id: string): Promise<BankAccountDto> {
    try {
      return await this.bankAccountsService.findOne(id);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve bank account with id ${id}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to retrieve bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'The bank account has been successfully updated.',
    type: UpdateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<UpdateResponseDto> {
    try {
      return await this.bankAccountsService.update(id, updateBankAccountDto);
    } catch (error) {
      this.logger.error(
        `Failed to update bank account with id ${id}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to update bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The bank account has been successfully deleted.',
    type: DeleteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async remove(@Param('id') id: string): Promise<DeleteResponseDto> {
    try {
      return await this.bankAccountsService.remove(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete bank account with id ${id}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to delete bank account', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
