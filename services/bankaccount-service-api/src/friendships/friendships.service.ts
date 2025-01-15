import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';

@Injectable()
export class FriendshipsService {
  private readonly logger = new Logger(FriendshipsService.name);

  constructor(private readonly neptuneService: NeptuneService) {}

  /**
   * Creates a new friendship edge from person1Id to person2Id.
   */
  async create({ person1Id, person2Id }: CreateFriendshipDto) {
    try {
      if (person1Id === person2Id) {
        throw new BadRequestException(
          'A person cannot be friends with themselves.',
        );
      }

      // Check if the friendship already exists
      const existingEdge = await this.neptuneService.findEdgeBetweenVertices(
        'has_friend',
        'Person',
        'personId',
        person1Id,
        person2Id,
      );
      if (existingEdge) {
        throw new BadRequestException(
          `Friendship between persons ${person1Id} and ${person2Id} already exists`,
        );
      }

      // Find person1 and person2 concurrently
      const [person1, person2] = await Promise.all([
        this.neptuneService.findVertexByProperty(
          'Person',
          'personId',
          person1Id,
        ),
        this.neptuneService.findVertexByProperty(
          'Person',
          'personId',
          person2Id,
        ),
      ]);

      if (!person1) {
        throw new NotFoundException(`Person with id ${person1Id} not found`);
      }
      if (!person2) {
        throw new NotFoundException(`Person with id ${person2Id} not found`);
      }

      // Create friendship edge
      const edge = await this.neptuneService.addEdge(
        'has_friend',
        person1.id,
        person2.id,
      );
      return edge;
    } catch (error) {
      this.logger.error(
        `Failed to create friendship between person ${person1Id} and person ${person2Id}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retrieves all friendship edges labeled "Friendship".
   */
  async findAll(): Promise<{ from: any; to: any }[]> {
    try {
      return await this.neptuneService.findConnectedVertices('has_friend');
    } catch (error) {
      this.logger.error(`Failed to retrieve friendships`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a single friendship by person1Id and person2Id.
   */
  async findOne(person1Id: string, person2Id: string): Promise<any> {
    try {
      const edge = await this.neptuneService.findEdgeBetweenVertices(
        'has_friend',
        'Person',
        'personId',
        person1Id,
        person2Id,
      );
      if (!edge) {
        throw new NotFoundException(
          `Friendship between persons ${person1Id} and ${person2Id} not found`,
        );
      }
      return edge;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve friendship for persons ${person1Id} and ${person2Id}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Removes a friendship by person1Id and person2Id.
   */
  async remove(
    person1Id: string,
    person2Id: string,
  ): Promise<DeleteResponseDto> {
    try {
      const existingEdge = await this.findOne(person1Id, person2Id);

      const deletedEdgeId = await this.neptuneService.deleteEdgeById(
        existingEdge.id,
      );
      return { deletedEdgeId: deletedEdgeId };
    } catch (error) {
      this.logger.error(
        `Failed to delete friendship between persons ${person1Id} and ${person2Id}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete friendship between persons ${person1Id} and ${person2Id}: ${error.message}`,
      );
    }
  }
}
