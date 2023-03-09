import { Module } from '@nestjs/common';
import { BitstampModule } from 'src/socket/bitstamp.module';
import { StreamingGateway } from './streaming.gateway';
import { StreamingService } from './streaming.service';

@Module({
  imports: [BitstampModule],
  providers: [StreamingGateway, StreamingService],
})
export class StreamingModule {}
