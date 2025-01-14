import { ApiProperty } from '@nestjs/swagger';

export class BankAccount {
  @ApiProperty()
  IBAN: string;

  @ApiProperty()
  currentBalance: number;
}
