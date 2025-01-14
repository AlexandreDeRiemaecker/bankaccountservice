import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { randomUUID } from 'crypto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { PersonDto } from './dto/person.dto';

@Injectable()
export class PersonsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  /**
   * Creates a new person.
   * @param createPersonDto - Data transfer object containing the details of the person to create.
   * @returns The created person.
   */
  async create(createPersonDto: CreatePersonDto): Promise<PersonDto> {
    const result = await this.neptuneService.addVertex('Person', {
      personId: randomUUID(),
      name: createPersonDto.name,
      email: createPersonDto.email,
    });
    return result;
  }

  /**
   * Retrieves all persons.
   * @returns A list of all persons.
   */
  async findAll() {
    return await this.neptuneService.findVertices('Person');
  }

  /**
   * Retrieves a person by their ID.
   * @param personId - The ID of the person to retrieve.
   * @returns The person with the specified ID.
   * @throws Error if the person is not found.
   */
  async findOne(personId: string): Promise<PersonDto> {
    const person = await this.neptuneService.findVertexByProperty(
      'Person',
      'personId',
      personId,
    );

    if (!person) {
      throw new Error('Person not found');
    }

    return person;
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
    const updatedVertexId = await this.neptuneService.updateVertex(
      'Person',
      'personId',
      id,
      updatePersonDto,
    );
    return { updatedVertexId };
  }

  /**
   * Removes a person by their ID.
   * @param id - The ID of the person to remove.
   * @returns The ID of the removed person.
   */
  async remove(id: string): Promise<DeleteResponseDto> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'Person',
      'personId',
      id,
    );
    return { deletedVertexId };
  }
}
