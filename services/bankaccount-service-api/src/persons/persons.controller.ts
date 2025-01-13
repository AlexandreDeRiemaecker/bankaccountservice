import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  async create(@Body() createPersonDto: CreatePersonDto) {
    try {
      return await this.personsService.create(createPersonDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.personsService.findAll();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to retrieve persons', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') personId: string) {
    try {
      return await this.personsService.findOne(personId);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Failed to retrieve person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    try {
      return await this.personsService.update(id, updatePersonDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.personsService.remove(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
