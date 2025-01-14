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
  Logger,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ApiResponse } from '@nestjs/swagger';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Controller('persons')
export class PersonsController {
  private readonly logger = new Logger(PersonsController.name);

  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The person has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async create(@Body() createPersonDto: CreatePersonDto) {
    try {
      return await this.personsService.create(createPersonDto);
    } catch (error) {
      this.logger.error('Failed to create person', error.stack);
      throw new HttpException(
        { message: 'Failed to create person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved persons.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findAll() {
    try {
      return await this.personsService.findAll();
    } catch (error) {
      this.logger.error('Failed to retrieve persons', error.stack);
      throw new HttpException(
        { message: 'Failed to retrieve persons', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved person.',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async findOne(@Param('id') personId: string) {
    try {
      return await this.personsService.findOne(personId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve person with id ${personId}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to retrieve person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'The person has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<UpdateResponseDto> {
    try {
      return await this.personsService.update(id, updatePersonDto);
    } catch (error) {
      this.logger.error(`Failed to update person with id ${id}`, error.stack);
      throw new HttpException(
        { message: 'Failed to update person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The person has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
    type: HttpException,
  })
  async remove(@Param('id') id: string): Promise<DeleteResponseDto> {
    try {
      return await this.personsService.remove(id);
    } catch (error) {
      this.logger.error(`Failed to delete person with id ${id}`, error.stack);
      throw new HttpException(
        { message: 'Failed to delete person', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
