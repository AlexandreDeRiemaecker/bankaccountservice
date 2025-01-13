import { Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { NeptuneService } from 'src/shared/neptune/neptune.service';

@Module({
  controllers: [PersonsController],
  providers: [PersonsService, NeptuneService],
})
export class PersonsModule {}
