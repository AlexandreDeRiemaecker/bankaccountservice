import { Test, TestingModule } from '@nestjs/testing';
import { NeptuneService } from './neptune.service';

describe('NeptuneService', () => {
  let service: NeptuneService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeptuneService],
    }).compile();

    service = module.get<NeptuneService>(NeptuneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize the service', () => {
    expect(service.getTraversal()).toBeDefined();
  });

  it('should add a vertex', async () => {
    const label = 'testLabel';
    const properties = { key: 'value' };

    jest.spyOn(service['g'], 'addV').mockReturnValue({
      property: jest.fn().mockReturnThis(),
      next: jest
        .fn()
        .mockResolvedValue({ value: { id: 'vertexId', ...properties } }),
    } as any);

    const result = await service.addVertex(label, properties);
    expect(result).toEqual({ id: 'vertexId', ...properties });
  });

  it('should add an edge', async () => {
    const label = 'testEdge';
    const fromVertexId = 'fromVertexId';
    const toVertexId = 'toVertexId';

    jest.spyOn(service['g'], 'V').mockReturnValue({
      addE: jest.fn().mockReturnThis(),
      to: jest.fn().mockReturnThis(),
      next: jest.fn().mockResolvedValue({ value: 'edgeId' }),
    } as any);

    const result = await service.addEdge(label, fromVertexId, toVertexId);
    expect(result).toEqual('edgeId');
  });

  it('should update a vertex', async () => {
    const label = 'testLabel';
    const idProperty = 'id';
    const idValue = 'vertexId';
    const updates = { key: 'newValue' };

    jest.spyOn(service['g'], 'V').mockReturnValue({
      hasLabel: jest.fn().mockReturnThis(),
      has: jest.fn().mockReturnThis(),
      property: jest.fn().mockReturnThis(),
      id: jest.fn().mockReturnThis(),
      next: jest.fn().mockResolvedValue({ value: 'updatedVertexId' }),
    } as any);

    const result = await service.updateVertex(
      label,
      idProperty,
      idValue,
      updates,
    );
    expect(result).toEqual('updatedVertexId');
  });

  it('should find vertices by label', async () => {
    const label = 'testLabel';
    const vertices = [{ key: 'value' }];

    jest.spyOn(service['g'], 'V').mockReturnValue({
      hasLabel: jest.fn().mockReturnThis(),
      valueMap: jest.fn().mockReturnThis(),
      toList: jest
        .fn()
        .mockResolvedValue(vertices.map((v) => new Map(Object.entries(v)))),
    } as any);

    const result = await service.findVertices(label);
    expect(result).toEqual(vertices);
  });

  it('should find a vertex by property', async () => {
    const label = 'testLabel';
    const idProperty = 'id';
    const idValue = 'vertexId';
    const vertex = { key: 'value' };

    jest.spyOn(service['g'], 'V').mockReturnValue({
      hasLabel: jest.fn().mockReturnThis(),
      has: jest.fn().mockReturnThis(),
      valueMap: jest.fn().mockReturnThis(),
      toList: jest.fn().mockResolvedValue([new Map(Object.entries(vertex))]),
    } as any);

    const result = await service.findVertexByProperty(
      label,
      idProperty,
      idValue,
    );
    expect(result).toEqual(vertex);
  });

  it('should delete a vertex', async () => {
    const label = 'testLabel';
    const idProperty = 'id';
    const idValue = 'vertexId';

    jest.spyOn(service['g'], 'V').mockReturnValue({
      hasLabel: jest.fn().mockReturnThis(),
      has: jest.fn().mockReturnThis(),
      id: jest.fn().mockReturnThis(),
      toList: jest.fn().mockResolvedValue(['vertexId']),
      drop: jest.fn().mockReturnThis(),
      iterate: jest.fn().mockResolvedValue(undefined),
    } as any);

    const result = await service.deleteVertex(label, idProperty, idValue);
    expect(result).toEqual('vertexId');
  });
});
