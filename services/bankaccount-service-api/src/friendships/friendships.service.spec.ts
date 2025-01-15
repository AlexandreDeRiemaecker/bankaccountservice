import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipsService } from './friendships.service';
import { EmptyLogger } from '../EmptyLogger';
import { SharedModule } from '../shared/shared.module';

describe('FriendshipsService', () => {
  let service: FriendshipsService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
