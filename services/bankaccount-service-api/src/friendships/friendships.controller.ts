import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { ApiResponse } from '@nestjs/swagger';
import { DeleteResponseDto } from '../bank-transactions/dto/delete-response.dto';

@Controller('friendships')
export class FriendshipsController {
  private readonly logger = new Logger(FriendshipsController.name);

  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The friendship has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async create(@Body() createFriendshipDto: CreateFriendshipDto) {
    try {
      return await this.friendshipsService.create(createFriendshipDto);
    } catch (error) {
      this.logger.error('Failed to create friendship', error.stack);
      throw new HttpException(
        { message: 'Failed to create friendship', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved friendships.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async findAll() {
    try {
      return await this.friendshipsService.findAll();
    } catch (error) {
      this.logger.error('Failed to retrieve friendships', error.stack);
      throw new HttpException(
        { message: 'Failed to retrieve friendships', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':person1Id/:person2Id')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved friendship.',
  })
  @ApiResponse({ status: 404, description: 'Friendship not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async findOne(
    @Param('person1Id') person1Id: string,
    @Param('person2Id') person2Id: string,
  ) {
    try {
      const friendship = await this.friendshipsService.findOne(
        person1Id,
        person2Id,
      );
      if (!friendship) {
        throw new NotFoundException(
          `Friendship between persons ${person1Id} and ${person2Id} not found`,
        );
      }
      return friendship;
    } catch (error) {
      this.logger.error('Failed to retrieve friendship', error.stack);
      throw new HttpException(
        { message: 'Failed to retrieve friendship', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':person1Id/:person2Id')
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted friendship.',
    type: DeleteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Friendship not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async remove(
    @Param('person1Id') person1Id: string,
    @Param('person2Id') person2Id: string,
  ) {
    try {
      return await this.friendshipsService.remove(person1Id, person2Id);
    } catch (error) {
      this.logger.error(
        `Failed to delete friendship between persons ${person1Id} and ${person2Id}`,
        error.stack,
      );
      throw new HttpException(
        { message: 'Failed to delete friendship', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
