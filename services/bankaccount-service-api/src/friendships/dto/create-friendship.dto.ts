import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for creating a friendship.
 */
export class CreateFriendshipDto {
  /**
   * The personId of the first person in the friendship.
   */
  @ApiProperty({
    description: 'The personId of the first person in the friendship.',
  })
  @IsString()
  @IsNotEmpty()
  person1Id: string;

  /**
   * The personId of the second person in the friendship.
   */
  @ApiProperty({
    description: 'The personId of the second person in the friendship.',
  })
  @IsString()
  @IsNotEmpty()
  person2Id: string;
}
