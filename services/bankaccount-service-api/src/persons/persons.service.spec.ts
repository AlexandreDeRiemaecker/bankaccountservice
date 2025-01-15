import { Test, TestingModule } from '@nestjs/testing';
import { PersonsService } from './persons.service';
import { SharedModule } from '../shared/shared.module';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { EmptyLogger } from '../EmptyLogger';

describe('PersonsService', () => {
  let service: PersonsService;
  let neptuneService: NeptuneService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [PersonsService],
    })
      .setLogger(new EmptyLogger())
      .compile();

    service = module.get<PersonsService>(PersonsService);
    neptuneService = module.get<NeptuneService>(NeptuneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a person', async () => {
    const createPersonDto: CreatePersonDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const result = {
      personId: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    jest.spyOn(neptuneService, 'addVertex').mockResolvedValue(result);

    expect(await service.create(createPersonDto)).toEqual(result);
  });

  it('should throw an error if person creation fails', async () => {
    const createPersonDto: CreatePersonDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    jest
      .spyOn(neptuneService, 'addVertex')
      .mockRejectedValue(new Error('Creation failed'));

    await expect(service.create(createPersonDto)).rejects.toThrow(
      'Creation failed',
    );
  });

  it('should find all persons', async () => {
    const result = [
      { personId: 'uuid', name: 'John Doe', email: 'john.doe@example.com' },
    ];

    jest.spyOn(neptuneService, 'findVertices').mockResolvedValue(result);

    expect(await service.findAll()).toEqual(result);
  });

  it('should throw an error if finding all persons fails', async () => {
    jest
      .spyOn(neptuneService, 'findVertices')
      .mockRejectedValue(new Error('Find all failed'));

    await expect(service.findAll()).rejects.toThrow('Find all failed');
  });

  it('should find one person by id', async () => {
    const result = {
      personId: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValue(result);

    expect(await service.findOne('uuid')).toEqual(result);
  });

  it('should throw an error if person not found', async () => {
    jest.spyOn(neptuneService, 'findVertexByProperty').mockResolvedValue(null);

    await expect(service.findOne('uuid')).rejects.toThrow('Person not found');
  });

  it('should update a person', async () => {
    const updatePersonDto: UpdatePersonDto = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    };
    const result = { updatedVertexId: 'uuid' };

    jest.spyOn(neptuneService, 'updateVertex').mockResolvedValue('uuid');

    expect(await service.update('uuid', updatePersonDto)).toEqual(result);
  });

  it('should throw an error if updating a person fails', async () => {
    const updatePersonDto: UpdatePersonDto = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    };

    jest
      .spyOn(neptuneService, 'updateVertex')
      .mockRejectedValue(new Error('Update failed'));

    await expect(service.update('uuid', updatePersonDto)).rejects.toThrow(
      'Update failed',
    );
  });

  it('should remove a person', async () => {
    const result = { deletedVertexId: 'uuid' };

    jest.spyOn(neptuneService, 'deleteVertex').mockResolvedValue('uuid');

    expect(await service.remove('uuid')).toEqual(result);
  });

  it('should throw an error if removing a person fails', async () => {
    jest
      .spyOn(neptuneService, 'deleteVertex')
      .mockRejectedValue(new Error('Delete failed'));

    await expect(service.remove('uuid')).rejects.toThrow('Delete failed');
  });
});
