import { Module } from '@nestjs/common';
import { BitstampService } from './bitstamp.service';

@Module({
  exports: [BitstampService],
  providers: [BitstampService],
})
export class BitstampModule {}
