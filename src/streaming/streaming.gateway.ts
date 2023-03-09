import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, WebSocket } from 'ws';
import { StreamingService } from './streaming.service';
import { BitstampService } from 'src/socket/bitstamp.service';

@WebSocketGateway(3001)
export class StreamingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // user and what he subscribed
  private subscriptions = new Map<any, string[]>();

  constructor(
    private readonly bitstampService: BitstampService,
    private readonly streamingService: StreamingService,
  ) {}
  handleConnection(ws: WebSocket) {
    this.subscriptions.set(ws, []);
  }

  handleDisconnect(ws: WebSocket) {
    this.subscriptions.delete(ws);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(ws: WebSocket, data: { currencyPair: string }) {
    // open the channel if no one has subscribed to this currency pair
    if (!this.isChannelSubscribed(data.currencyPair)) {
      this.bitstampService.openChannel(data.currencyPair);
    }

    const pairs = this.subscriptions.get(ws);
    // check currency pair exist or not
    if (pairs.includes(data.currencyPair)) {
      return;
    }
    pairs.push(data.currencyPair);

    this.streamingService.subscribe(data.currencyPair, ws);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(ws: WebSocket, data: { currencyPair: string }) {
    console.log(`Client unsubscribed from ${data.currencyPair}`);
    const pairs = this.subscriptions.get(ws) || [];
    const index = pairs.indexOf(data.currencyPair);

    if (index !== -1) {
      pairs.splice(index, 1);
      this.subscriptions.set(ws, pairs);
    }

    // remove the WebSocket from the observer list of the StreamingService
    this.streamingService.unsubscribe(data.currencyPair);

    // close the channel if no one has subscribed
    if (!this.isChannelSubscribed(data.currencyPair)) {
      this.bitstampService.closeChannel(data.currencyPair);
    }
    console.log('new pair==>', this.subscriptions.get(ws));
  }

  isChannelSubscribed(currencyPair: string) {
    const allPairs = this.subscriptions.values();
    for (const pairs of allPairs) {
      if (pairs.includes(currencyPair)) {
        return true;
      }
    }
    return false;
  }
}
