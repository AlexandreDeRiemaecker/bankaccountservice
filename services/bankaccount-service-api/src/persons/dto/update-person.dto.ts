import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

/**
 * Data Transfer Object for updating a person's details.
 */
export class UpdatePersonDto {
  /**
   * The name of the person.
   * @optional
   */
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  name?: string;

  /**
   * The email address of the person.
   * @optional
   */
  @IsOptional()
  @ApiPropertyOptional()
  @IsEmail()
  email?: string;
}
