import { Injectable, Logger } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { randomUUID } from 'crypto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { PersonDto } from './dto/person.dto';

@Injectable()
export class PersonsService {
  private readonly logger = new Logger(PersonsService.name);

  constructor(private readonly neptuneService: NeptuneService) {}

  /**
   * Creates a new person.
   * @param createPersonDto - Data transfer object containing the details of the person to create.
   * @returns The created person.
   */
  async create(createPersonDto: CreatePersonDto): Promise<PersonDto> {
    try {
      const result = await this.neptuneService.addVertex('Person', {
        personId: randomUUID(),
        name: createPersonDto.name,
        email: createPersonDto.email,
      });
      return result;
    } catch (error) {
      this.logger.error('Failed to create person', error.stack);
      throw error;
    }
  }

  /**
   * Retrieves all persons.
   * @returns A list of all persons.
   */
  async findAll(): Promise<PersonDto[]> {
    try {
      return await this.neptuneService.findVertices('Person');
    } catch (error) {
      this.logger.error('Failed to retrieve persons', error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a person by their ID.
   * @param personId - The ID of the person to retrieve.
   * @returns The person with the specified ID.
   * @throws Error if the person is not found.
   */
  async findOne(personId: string): Promise<PersonDto> {
    try {
      const person = await this.neptuneService.findVertexByProperty(
        'Person',
        'personId',
        personId,
      );

      if (!person) {
        throw new Error('Person not found');
      }

      return person;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve person with id ${personId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates a person by their ID.
   * @param id - The ID of the person to update.
   * @param updatePersonDto - Data transfer object containing the updated details of the person.
   * @returns The ID of the updated person.
   */
  async update(
    id: string,
    updatePersonDto: UpdatePersonDto,
  ): Promise<UpdateResponseDto> {
    try {
      const updatedVertexId = await this.neptuneService.updateVertex(
        'Person',
        'personId',
        id,
        updatePersonDto,
      );
      return { updatedVertexId };
    } catch (error) {
      this.logger.error(`Failed to update person with id ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Removes a person by their ID.
   * @param id - The ID of the person to remove.
   * @returns The ID of the removed person.
   */
  async remove(id: string): Promise<DeleteResponseDto> {
    try {
      const deletedVertexId = await this.neptuneService.deleteVertex(
        'Person',
        'personId',
        id,
      );
      return { deletedVertexId };
    } catch (error) {
      this.logger.error(`Failed to delete person with id ${id}`, error.stack);
      throw error;
    }
  }
}
