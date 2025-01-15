import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { SharedModule } from '../shared/shared.module';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountDto } from './dto/bank-account.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { EmptyLogger } from '../EmptyLogger';

describe('BankAccountsController', () => {
  let controller: BankAccountsController;
  let service: BankAccountsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const moduleMocker = new ModuleMocker(global);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [BankAccountsController],
    })
      .setLogger(new EmptyLogger())
      .useMocker((token) => {
        if (token === BankAccountsService) {
          return {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get<BankAccountsController>(BankAccountsController);
    service = moduleRef.get<BankAccountsService>(BankAccountsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bank account', async () => {
      const createBankAccountDto: CreateBankAccountDto = {
        personId: '1',
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };
      const result: BankAccountDto = {
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createBankAccountDto)).toBe(result);
    });

    it('should throw an error if creation fails', async () => {
      const createBankAccountDto: CreateBankAccountDto = {
        personId: '1',
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createBankAccountDto)).rejects.toThrow(
        'Failed to create bank account',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of bank accounts', async () => {
      const result: BankAccountDto[] = [
        {
          IBAN: 'DE1234567890',
          currentBalance: 1000,
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
        'Failed to retrieve bank accounts',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single bank account', async () => {
      const result: BankAccountDto = {
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
    });

    it('should throw an error if bank account is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('1')).rejects.toThrow(
        'Failed to retrieve bank account',
      );
    });
  });

  describe('update', () => {
    it('should update a bank account', async () => {
      const updateBankAccountDto: UpdateBankAccountDto = {
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };
      const result: UpdateResponseDto = { updatedVertexId: 'UUID' };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', updateBankAccountDto)).toBe(result);
    });

    it('should throw an error if update fails', async () => {
      const updateBankAccountDto: UpdateBankAccountDto = {
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.update('1', updateBankAccountDto),
      ).rejects.toThrow('Failed to update bank account');
    });
  });

  describe('remove', () => {
    it('should delete a bank account', async () => {
      const result: DeleteResponseDto = { deletedVertexId: 'UUID' };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove('1')).toBe(result);
    });

    it('should throw an error if deletion fails', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.remove('1')).rejects.toThrow(
        'Failed to delete bank account',
      );
    });
  });
});
