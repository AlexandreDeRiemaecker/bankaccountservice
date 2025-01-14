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
      otherPersonIBAN: 'DE1234567890',
      amount: 1000,
    };

    jest
      .spyOn(neptuneService, 'addVertex')
      .mockResolvedValue(createBankTransactionDto);

    const result = await service.create(createBankTransactionDto);
    expect(result).toEqual(createBankTransactionDto);
  });

  it('should find all bank transactions', async () => {
    const bankTransactions = [
      { otherPersonIBAN: 'DE1234567890', amount: 1000 },
      { otherPersonIBAN: 'DE0987654321', amount: 2000 },
    ];

    jest
      .spyOn(neptuneService, 'findVertices')
      .mockResolvedValue(bankTransactions);

    const result = await service.findAll();
    expect(result).toEqual(bankTransactions);
  });

  it('should find one bank transaction by transactionId', async () => {
    const bankTransaction = { otherPersonIBAN: 'DE1234567890', amount: 1000 };

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

  it('should update a bank transaction', async () => {
    const updateBankTransactionDto: UpdateBankTransactionDto = {
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

  it('should remove a bank transaction', async () => {
    jest
      .spyOn(neptuneService, 'deleteVertex')
      .mockResolvedValue('deletedVertexId');

    const result = await service.remove('transactionId');
    expect(result).toEqual({ deletedVertexId: 'deletedVertexId' });
  });
});
