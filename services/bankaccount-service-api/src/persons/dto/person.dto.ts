import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents a person with unique identifiers and contact information.
 */
export class PersonDto {
  /**
   * The unique identifier for the person (vertex ID in Neptune).
   */
  @ApiProperty({
    description: 'The unique identifier for the person (vertex ID in Neptune).',
  })
  id: string;

  /**
   * The business identifier for the person.
   */
  @ApiProperty({ description: 'The business identifier for the person.' })
  personId: string;

  /**
   * The name of the person.
   */
  @ApiProperty({ description: 'The name of the person.' })
  name: string;

  /**
   * The email address of the person.
   */
  @ApiProperty({ description: 'The email address of the person.' })
  email: string;
}
