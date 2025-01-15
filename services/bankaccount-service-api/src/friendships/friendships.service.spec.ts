import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipsService } from './friendships.service';
import { EmptyLogger } from '../EmptyLogger';
import { SharedModule } from '../shared/shared.module';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { NotFoundException } from '@nestjs/common';

describe('FriendshipsService', () => {
  let service: FriendshipsService;
  let neptuneService: NeptuneService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [FriendshipsService],
    })
      .setLogger(new EmptyLogger())
      .compile();

    service = moduleRef.get<FriendshipsService>(FriendshipsService);
    neptuneService = moduleRef.get<NeptuneService>(NeptuneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if persons are the same', async () => {
    const createFriendshipDto: CreateFriendshipDto = {
      person1Id: 'person1Id',
      person2Id: 'person1Id',
    };

    await expect(service.create(createFriendshipDto)).rejects.toThrow(
      'A person cannot be friends with themselves.',
    );
  });

  it('should create a new friendship if not found', async () => {
    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockResolvedValue(null);
    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValue({ id: 'mockPersonId' });
    jest
      .spyOn(neptuneService, 'addEdge')
      .mockResolvedValue({ id: 'newEdgeId' });

    const createFriendshipDto: CreateFriendshipDto = {
      person1Id: 'person1Id',
      person2Id: 'person2Id',
    };
    const result = await service.create(createFriendshipDto);
    expect(result).toEqual({ id: 'newEdgeId' });
  });

  it('should throw BadRequestException if friendship already exists', async () => {
    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockResolvedValue({ from: 'person1Id', to: 'person2Id' });
    const createFriendshipDto: CreateFriendshipDto = {
      person1Id: 'person1Id',
      person2Id: 'person2Id',
    };
    await expect(service.create(createFriendshipDto)).rejects.toThrow(
      'Friendship between persons person1Id and person2Id already exists',
    );
  });

  it('should throw NotFoundException if person1 not found', async () => {
    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockResolvedValue(null);
    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValueOnce(null) // person1 not found
      .mockResolvedValueOnce({}); // person2
    const createFriendshipDto: CreateFriendshipDto = {
      person1Id: 'missingPerson1',
      person2Id: 'person2Id',
    };
    await expect(service.create(createFriendshipDto)).rejects.toThrow(
      'Person with id missingPerson1 not found',
    );
  });

  it('should throw NotFoundException if person2 not found', async () => {
    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockResolvedValue(null);
    jest
      .spyOn(neptuneService, 'findVertexByProperty')
      .mockResolvedValueOnce({}) // person1
      .mockResolvedValueOnce(null); // person2 not found
    const createFriendshipDto: CreateFriendshipDto = {
      person1Id: 'person1Id',
      person2Id: 'missingPerson2',
    };
    await expect(service.create(createFriendshipDto)).rejects.toThrow(
      'Person with id missingPerson2 not found',
    );
  });

  it('should find all friendships', async () => {
    const friendships = [
      { from: 'person1Id', to: 'person2Id' },
      { from: 'person3Id', to: 'person4Id' },
    ];

    jest
      .spyOn(neptuneService, 'findConnectedVertices')
      .mockResolvedValue(friendships);

    const result = await service.findAll();
    expect(result).toEqual(friendships);
  });

  it('should find one friendship', async () => {
    const friendship = { from: 'person1Id', to: 'person2Id' };

    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockResolvedValue({ from: 'person1Id', to: 'person2Id' });

    const result = await service.findOne('person1Id', 'person2Id');
    expect(result).toEqual(friendship);
  });

  it('should throw an error if friendship is not found', async () => {
    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockRejectedValue(false);

    await expect(service.findOne('person1Id', 'person2Id')).rejects.toThrow(
      `Friendship between persons person1Id and person2Id not found`,
    );
  });

  it('should return null if friendship is not found in findOne', async () => {
    jest
      .spyOn(neptuneService, 'findEdgeBetweenVertices')
      .mockResolvedValue(null);

    await expect(service.findOne('person1Id', 'person2Id')).rejects.toThrow(
      'Friendship between persons person1Id and person2Id not found',
    );
  });

  it('should remove a friendship', async () => {
    const friendship = { id: 'edgeId', label: 'has_friend' };

    jest.spyOn(service, 'findOne').mockResolvedValue(friendship);
    jest
      .spyOn(neptuneService, 'deleteEdgeById')
      .mockResolvedValue('deletedEdgeId');

    const result = await service.remove('person1Id', 'person2Id');
    expect(result).toEqual({ deletedEdgeId: 'deletedEdgeId' });
  });

  it('should throw an error if friendship to remove is not found', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(service.remove('person1Id', 'person2Id')).rejects.toThrow(
      'Failed to delete friendship between persons person1Id and person2Id',
    );
  });

  it('should throw an error if friendship to remove is not found in remove', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(service.remove('person1Id', 'person2Id')).rejects.toThrow(
      'Failed to delete friendship between persons person1Id and person2Id',
    );
  });
});
