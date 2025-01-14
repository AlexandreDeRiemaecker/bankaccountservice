import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionsService } from './bank-transactions.service';
import { SharedModule } from '../shared/shared.module';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';

describe('BankTransactionsService', () => {
  let service: BankTransactionsService;
  let neptuneService: NeptuneService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [BankTransactionsService],
    }).compile();

    service = module.get<BankTransactionsService>(BankTransactionsService);
    neptuneService = module.get<NeptuneService>(NeptuneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new bank transaction', async () => {
    const createBankTransactionDto: CreateBankTransactionDto = {
      transactionId: 'transactionId',
      bankAccountIBAN: 'DE9876543210',
      otherPersonIBAN: 'DE1234567890',
      amount: 1000,
    };

    const otherPerson = { id: 'otherPersonId', IBAN: 'DE1234567890' };
    const bankAccount = { id: 'bankAccountId', IBAN: 'DE9876543210' };
    const newTransaction = {
      id: 'newTransactionId',
      ...createBankTransactionDto,
    };

    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValueOnce(otherPerson)
      .mockResolvedValueOnce(bankAccount);

    jest.spyOn(neptuneService, 'addVertex').mockResolvedValue(newTransaction);

    // Add the missing addEdge mock here
    jest.spyOn(neptuneService, 'addEdge').mockResolvedValue({
      id: 'edgeId',
      label: 'TRANSFER',
    });

    const result = await service.create(createBankTransactionDto);
    expect(result).toEqual(newTransaction);
  });

  it('should throw an error if bank account is not found', async () => {
    const createBankTransactionDto: CreateBankTransactionDto = {
      transactionId: 'transactionId',
      bankAccountIBAN: 'DE9876543210',
      otherPersonIBAN: 'DE1234567890',
      amount: 1000,
    };

    jest.spyOn(neptuneService, 'findVertexByProperty').mockResolvedValue(null);

    await expect(service.create(createBankTransactionDto)).rejects.toThrow(
      'BankAccount not found',
    );
  });

  it('should find all bank transactions', async () => {
    const bankTransactions = [
      {
        transactionId: 'transactionId1',
        amount: 1000,
        otherPersonIBAN: 'DE1234567890',
      },
      {
        transactionId: 'transactionId2',
        amount: 2000,
        otherPersonIBAN: 'DE0987654321',
      },
    ];

    jest
      .spyOn(neptuneService, 'findVertices')
      .mockResolvedValue(bankTransactions);

    const result = await service.findAll();
    expect(result).toEqual(bankTransactions);
  });

  it('should find one bank transaction', async () => {
    const bankTransaction = {
      transactionId: 'transactionId',
      amount: 1000,
      otherPersonIBAN: 'DE1234567890',
    };

    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValue(bankTransaction);

    const result = await service.findOne('transactionId');
    expect(result).toEqual(bankTransaction);
  });

  it('should throw an error if bank transaction is not found', async () => {
    jest.spyOn(neptuneService, 'findVertexByProperty').mockResolvedValue(null);

    await expect(service.findOne('transactionId')).rejects.toThrow(
      'BankTransaction not found',
    );
  });

  it('should throw an error if other person bank account is not found', async () => {
    const createBankTransactionDto: CreateBankTransactionDto = {
      transactionId: 'transactionId',
      bankAccountIBAN: 'DE9876543210',
      otherPersonIBAN: 'DE1234567890',
      amount: 1000,
    };

    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValueOnce(null);

    await expect(service.create(createBankTransactionDto)).rejects.toThrow(
      'Other person BankAccount not found',
    );
  });

  it('should throw an error if transaction amount is not positive', async () => {
    const createBankTransactionDto: CreateBankTransactionDto = {
      transactionId: 'transactionId',
      bankAccountIBAN: 'DE9876543210',
      otherPersonIBAN: 'DE1234567890',
      amount: -1000,
    };

    await expect(service.create(createBankTransactionDto)).rejects.toThrow(
      'Transaction amount must be positive',
    );
  });

  it('should update a bank transaction', async () => {
    const updateBankTransactionDto: UpdateBankTransactionDto = {
      bankAccountIBAN: 'DE9876543210',
      otherPersonIBAN: 'DE123456789',
      amount: 2000,
    };

    jest
      .spyOn(neptuneService, 'updateVertex')
      .mockResolvedValue('updatedVertexId');

    const result = await service.update(
      'transactionId',
      updateBankTransactionDto,
    );
    expect(result).toEqual({ updatedVertexId: 'updatedVertexId' });
  });

  it('should throw an error if update amount is not provided', async () => {
    const updateBankTransactionDto: UpdateBankTransactionDto = {
      bankAccountIBAN: 'DE987654321',
      otherPersonIBAN: 'DE123456789',
    };

    await expect(
      service.update('transactionId', updateBankTransactionDto),
    ).rejects.toThrow('Malformed request: amount is required');
  });

  it('should remove a bank transaction', async () => {
    jest
      .spyOn(neptuneService, 'deleteVertex')
      .mockResolvedValue('deletedVertexId');

    const result = await service.remove('transactionId');
    expect(result).toEqual({ deletedVertexId: 'deletedVertexId' });
  });
});
