import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, WebSocket } from 'ws';

@WebSocketGateway(3001)
export class StreamingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // user and what he subscribed
  private subscriptions = new Map<any, string[]>();
  private id: string;

  handleConnection(ws: WebSocket) {
    // unique id
    this.id = ws._socket.remoteAddress;
    console.log('Client connected ', this.id);
    this.subscriptions.set(this.id, []);
  }

  handleDisconnect() {
    console.log('Client disconnected', this.id);
    this.subscriptions.delete(this.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(ws: WebSocket, data: { currencyPair: string }) {
    console.log(`Client ${this.id} subscribed to pairs: ${data.currencyPair}`);
    const pairs = this.subscriptions.get(this.id);
    // check subscribe limit
    if (pairs.length >= 10) {
      console.log('error');
      ws.send(
        JSON.stringify({
          event: 'error',
          message: 'You have already subscribed to 10 currency pairs.',
        }),
      );
    } else {
      // check currency pair exist or not
      if (!pairs.includes(data.currencyPair)) {
        pairs.push(data.currencyPair);
      }
    }
    console.log('pairs===>', pairs);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(ws: WebSocket, data: { currencyPair: string }) {
    console.log(`Client unsubscribed from ${data.currencyPair}`);
    const pairs = this.subscriptions.get(this.id) || [];
    const index = pairs.indexOf(data.currencyPair);

    if (index !== -1) {
      pairs.splice(index, 1);
      this.subscriptions.set(this.id, pairs);
    }
    console.log('new pair==>', this.subscriptions.get(this.id));
  }
}
