import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

/**
 * Data Transfer Object for creating a person.
 */
export class CreatePersonDto {
  /**
   * The name of the person.
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The email address of the person.
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
