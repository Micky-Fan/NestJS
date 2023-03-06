import { Injectable, OnModuleInit } from '@nestjs/common';
import { Observable } from 'rxjs';
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

  subscribeBitstamp(currencyPair: string) {
    const data = JSON.stringify({
      event: 'bts:subscribe',
      data: {
        channel: `live_trades_${currencyPair}`,
      },
    });
    this.bitstampWs.send(data);
    this.bitstampWs.on('message', (msg) => {
      console.log('msg===>', JSON.parse(msg));
    });
  }

  getData() {
    const stream$ = new Observable((observer) => {
      this.bitstampWs.onmessage = (msg: any) => {
        const message = JSON.parse(msg.data);
        observer.next(message);
      };
    });
    return stream$;
  }
}
