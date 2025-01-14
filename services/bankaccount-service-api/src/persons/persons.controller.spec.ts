import { Test, TestingModule } from '@nestjs/testing';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { SharedModule } from '../shared/shared.module';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './dto/person.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';

describe('PersonsController', () => {
  let controller: PersonsController;
  let service: PersonsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const moduleMocker = new ModuleMocker(global);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [PersonsController],
    })
      .useMocker((token) => {
        if (token === PersonsService) {
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

    controller = moduleRef.get<PersonsController>(PersonsController);
    service = moduleRef.get<PersonsService>(PersonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a person', async () => {
      const dto: CreatePersonDto = { name: 'John', email: 'john@example.com' };
      const result: Person = {
        id: 'UUID',
        personId: 'UUID',
        name: 'John',
        email: 'john@example.com',
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
    });

    it('should throw an error if creation fails', async () => {
      const dto: CreatePersonDto = { name: 'John', email: 'john@example.com' };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(dto)).rejects.toThrow(
        'Failed to create person',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of persons', async () => {
      const result: Person[] = [
        {
          id: 'UUID1',
          personId: 'UUID1',
          name: 'John',
          email: 'john@example.com',
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
        'Failed to retrieve persons',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single person', async () => {
      const result: Person = {
        id: 'UUID2',
        personId: 'UUID2',
        name: 'Jane',
        email: 'jane@example.com',
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('UUID2')).toBe(result);
    });

    it('should throw an error if person is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('UUID2')).rejects.toThrow(
        'Failed to retrieve person',
      );
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      const dto: UpdatePersonDto = {
        name: 'JohnUpdated',
        email: 'johnupdated@example.com',
      };
      const result: UpdateResponseDto = { updatedVertexId: 'UUID3' };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('UUID3', dto)).toBe(result);
    });

    it('should throw an error if update fails', async () => {
      const dto: UpdatePersonDto = {
        name: 'Error',
        email: 'error@example.com',
      };
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new Error('Update failed'));

      await expect(controller.update('UUID4', dto)).rejects.toThrow(
        'Failed to update person',
      );
    });
  });

  describe('remove', () => {
    it('should delete a person', async () => {
      const result: DeleteResponseDto = { deletedVertexId: 'UUID5' };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove('UUID5')).toBe(result);
    });

    it('should throw an error if deletion fails', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.remove('UUID6')).rejects.toThrow(
        'Failed to delete person',
      );
    });
  });
});
