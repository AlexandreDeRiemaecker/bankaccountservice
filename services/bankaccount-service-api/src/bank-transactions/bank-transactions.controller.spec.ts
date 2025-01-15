import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionsController } from './bank-transactions.controller';
import { BankTransactionsService } from './bank-transactions.service';
import { SharedModule } from '../shared/shared.module';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { BankTransactionDto } from './dto/bank-transaction.dto';
import { HttpException } from '@nestjs/common';
import { EmptyLogger } from '../EmptyLogger';

describe('BankTransactionsController', () => {
  let controller: BankTransactionsController;
  let service: BankTransactionsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [BankTransactionsController],
      providers: [BankTransactionsService],
    })
      .setLogger(new EmptyLogger())
      .compile();

    controller = moduleRef.get<BankTransactionsController>(
      BankTransactionsController,
    );
    service = moduleRef.get<BankTransactionsService>(BankTransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bank transaction', async () => {
      const createBankTransactionDto: CreateBankTransactionDto = {
        transactionId: 'transactionId',
        bankAccountIBAN: 'DE9876543210',
        otherPersonIBAN: 'DE1234567890',
        amount: 1000,
      };
      const result: BankTransactionDto = {
        transactionId: 'transactionId',
        destinationIBAN: 'DE1234567890',
        amount: 1000,
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createBankTransactionDto)).toBe(result);
    });

    it('should throw an error if creation fails', async () => {
      const createBankTransactionDto: CreateBankTransactionDto = {
        transactionId: 'transactionId',
        bankAccountIBAN: 'DE9876543210',
        otherPersonIBAN: 'DE1234567890',
        amount: 1000,
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createBankTransactionDto)).rejects.toThrow(
        'Failed to create bank transaction',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of bank transactions', async () => {
      const result: BankTransactionDto[] = [
        {
          transactionId: 'transactionId',
          destinationIBAN: 'DE1234567890',
          amount: 1000,
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });

    it('should throw an error if retrieval fails', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new Error('Retrieval failed'));

      await expect(controller.findAll()).rejects.toThrow(
        'Failed to retrieve bank transactions',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single bank transaction', async () => {
      const result: BankTransactionDto = {
        transactionId: 'transactionId',
        destinationIBAN: 'DE1234567890',
        amount: 1000,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('transactionId')).toBe(result);
    });

    it('should throw an error if bank transaction is not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new Error('Failed to retrieve bank transaction'));

      await expect(controller.findOne('transactionId')).rejects.toThrow(
        'Failed to retrieve bank transaction',
      );
    });
  });

  describe('update', () => {
    it('should update a bank transaction', async () => {
      const updateBankTransactionDto = {
        amount: 2000,
        otherPersonIBAN: 'DE1234567890',
        bankAccountIBAN: 'DE9876543210',
      };
      const result = { updatedVertexId: 'updatedVertexId' };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(
        await controller.update('transactionId', updateBankTransactionDto),
      ).toBe(result);
    });

    it('should throw an error if update fails', async () => {
      const updateBankTransactionDto = {
        amount: 2000,
        otherPersonIBAN: 'DE1234567890',
        bankAccountIBAN: 'DE9876543210',
      };
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.update('transactionId', updateBankTransactionDto),
      ).rejects.toThrow('Failed to update bank transaction');
    });
  });

  describe('remove', () => {
    it('should delete a bank transaction', async () => {
      const result = { deletedVertexId: 'deletedVertexId' };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove('transactionId')).toBe(result);
    });

    it('should throw an error if deletion fails', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.remove('transactionId')).rejects.toThrow(
        'Failed to delete bank transaction',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single bank transaction', async () => {
      const result: BankTransactionDto = {
        transactionId: 'transactionId',
        destinationIBAN: 'DE1234567890',
        amount: 1000,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('transactionId')).toBe(result);
    });

    it('should throw an HttpException if an error occurs', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.findOne('transactionId')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
