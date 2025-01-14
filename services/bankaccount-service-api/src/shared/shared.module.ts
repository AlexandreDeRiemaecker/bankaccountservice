import { Module, Global } from '@nestjs/common';
import { NeptuneService } from './neptune/neptune.service';

@Global()
@Module({
  providers: [NeptuneService],
  exports: [NeptuneService],
})
export class SharedModule {}
