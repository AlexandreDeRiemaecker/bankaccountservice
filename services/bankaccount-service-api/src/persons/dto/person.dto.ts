import { ApiProperty } from '@nestjs/swagger';

export class Person {
  @ApiProperty({
    description: 'The unique identifier for the person (vertex ID in Neptune).',
  })
  id: string;

  @ApiProperty({ description: 'The business identifier for the person.' })
  personId: string;

  @ApiProperty({ description: 'The name of the person.' })
  name: string;

  @ApiProperty({ description: 'The email address of the person.' })
  email: string;
}
