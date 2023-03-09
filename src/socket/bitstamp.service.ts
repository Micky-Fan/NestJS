import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
@Injectable()
export class BitstampService implements OnModuleInit {
  private readonly bitstampWs: WebSocket;
  constructor() {
    this.bitstampWs = new WebSocket('wss://ws.bitstamp.net.');
  }

  onModuleInit() {
    console.log('It is inited');
    this.bitstampWs.on('open', () => {
      console.log('connect');
    });
    this.bitstampWs.on('error', console.error);
  }

  openChannel(currencyPair: string) {
    const data = JSON.stringify({
      event: 'bts:subscribe',
      data: {
        channel: `live_trades_${currencyPair}`,
      },
    });
    this.bitstampWs.send(data);
  }

  closeChannel(currencyPair: string) {
    const data = JSON.stringify({
      event: 'bts:unsubscribe',
      data: {
        channel: `live_trades_${currencyPair}`,
      },
    });
    this.bitstampWs.send(data);
  }

  getWebSocket(): WebSocket {
    return this.bitstampWs;
  }
}
