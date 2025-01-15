import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { EmptyLogger } from '../EmptyLogger';
import { SharedModule } from '../shared/shared.module';

describe('FriendshipsController', () => {
  let controller: FriendshipsController;
  // let service: FriendshipsService;

  beforeAll(() => {
    process.env.NEPTUNE_ENDPOINT_HOSTNAME = 'localhost';
    process.env.NEPTUNE_ENDPOINT_PORT = '8182';
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [FriendshipsController],
      providers: [FriendshipsService],
    })
      .setLogger(new EmptyLogger())
      .compile();

    controller = moduleRef.get<FriendshipsController>(FriendshipsController);
    // service = moduleRef.get<FriendshipsService>(FriendshipsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
