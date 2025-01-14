import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountsService } from './bank-accounts.service';
import { SharedModule } from '../shared/shared.module';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';

describe('BankAccountsService', () => {
  let service: BankAccountsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [BankAccountsService],
    }).compile();

    service = module.get<BankAccountsService>(BankAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('BankAccountsService', () => {
    let service: BankAccountsService;
    let neptuneService: NeptuneService;

    beforeAll(() => {
      process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
      process.env.NEPTUNE_ENDPOINT_PORT = '8182';
    });

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [SharedModule],
        providers: [BankAccountsService],
      }).compile();

      service = module.get<BankAccountsService>(BankAccountsService);
      neptuneService = module.get<NeptuneService>(NeptuneService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a new bank account', async () => {
      const createBankAccountDto: CreateBankAccountDto = {
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };

      jest
        .spyOn(neptuneService, 'findVertexByProperty')
        .mockResolvedValue(null);
      jest
        .spyOn(neptuneService, 'addVertex')
        .mockResolvedValue(createBankAccountDto);

      const result = await service.create(createBankAccountDto);
      expect(result).toEqual(createBankAccountDto);
    });

    it('should throw an error if bank account already exists', async () => {
      const createBankAccountDto: CreateBankAccountDto = {
        IBAN: 'DE1234567890',
        currentBalance: 1000,
      };

      jest
        .spyOn(neptuneService, 'findVertexByProperty')
        .mockResolvedValue(createBankAccountDto);

      await expect(service.create(createBankAccountDto)).rejects.toThrow(
        'BankAccount with this IBAN already exists',
      );
    });

    it('should find all bank accounts', async () => {
      const bankAccounts = [
        { IBAN: 'DE1234567890', currentBalance: 1000 },
        { IBAN: 'DE0987654321', currentBalance: 2000 },
      ];

      jest
        .spyOn(neptuneService, 'findVertices')
        .mockResolvedValue(bankAccounts);

      const result = await service.findAll();
      expect(result).toEqual(bankAccounts);
    });

    it('should find one bank account by IBAN', async () => {
      const bankAccount = { IBAN: 'DE1234567890', currentBalance: 1000 };

      jest
        .spyOn(neptuneService, 'findVertexByProperty')
        .mockResolvedValue(bankAccount);

      const result = await service.findOne('DE1234567890');
      expect(result).toEqual(bankAccount);
    });

    it('should throw an error if bank account is not found', async () => {
      jest
        .spyOn(neptuneService, 'findVertexByProperty')
        .mockResolvedValue(null);

      await expect(service.findOne('DE1234567890')).rejects.toThrow(
        'BankAccount not found',
      );
    });

    it('should update a bank account', async () => {
      const updateBankAccountDto: UpdateBankAccountDto = {
        currentBalance: 1500,
      };
      const updateResponse = { updatedVertexId: 'DE1234567890' };

      jest
        .spyOn(neptuneService, 'updateVertex')
        .mockResolvedValue('DE1234567890');

      const result = await service.update('DE1234567890', updateBankAccountDto);
      expect(result).toEqual(updateResponse);
    });

    it('should remove a bank account', async () => {
      const deleteResponse = { deletedVertexId: 'DE1234567890' };

      jest
        .spyOn(neptuneService, 'deleteVertex')
        .mockResolvedValue('DE1234567890');

      const result = await service.remove('DE1234567890');
      expect(result).toEqual(deleteResponse);
    });
  });
});
