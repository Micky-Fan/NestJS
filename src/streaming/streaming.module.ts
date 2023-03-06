import { Module } from '@nestjs/common';
import { BitstampModule } from 'src/socket/bitstamp.module';
import { StreamingGateway } from './streaming.gateway';

@Module({
  imports: [BitstampModule],
  providers: [StreamingGateway],
})
export class StreamingModule {}
