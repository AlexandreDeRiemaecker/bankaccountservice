import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { NeptuneService } from '../shared/neptune/neptune.service';
import { randomUUID } from 'crypto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { Person } from './dto/person.dto';

@Injectable()
export class PersonsService {
  constructor(private readonly neptuneService: NeptuneService) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const result = await this.neptuneService.addVertex('Person', {
      personId: randomUUID(),
      name: createPersonDto.name,
      email: createPersonDto.email,
    });
    return result;
  }

  async findAll() {
    return await this.neptuneService.findVertices('Person');
  }

  async findOne(personId: string): Promise<Person> {
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

  async remove(id: string): Promise<DeleteResponseDto> {
    const deletedVertexId = await this.neptuneService.deleteVertex(
      'Person',
      'personId',
      id,
    );
    return { deletedVertexId };
  }
}
