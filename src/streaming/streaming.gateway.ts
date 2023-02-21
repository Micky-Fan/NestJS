import { OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { StreamingService } from './streaming.service';

@WebSocketGateway({ namespace: 'streaming' })
export class StreamingGateway implements OnModuleInit {
  public bitstampWs;
  constructor(private readonly streamingService: StreamingService) {
    this.bitstampWs = new WebSocket('wss://ws.bitstamp.net.');
  }
  @WebSocketServer()
  server: Server;
  onModuleInit() {
    // connect bitstamp
    this.bitstampWs.on('open', () => {
      console.log('connect');
    });
    this.bitstampWs.on('error', console.error);

    this.server.on('connect', (socket) => {
      console.log('socket id', socket.id);
      console.log('connected');
    });
  }

  @SubscribeMessage('subscribe')
  subscribe(@MessageBody() currencyPair: string) {
    const subscribeObj = {
      event: 'bts:subscribe',
      data: {
        channel: `live_orders_${currencyPair}`,
      },
    };
    this.bitstampWs.send(JSON.stringify(subscribeObj));
    this.bitstampWs.on('message', (message) => {
      const data = JSON.parse(message);
      this.server.emit('price', {
        price: data.data.price,
      });
    });
  }
  @SubscribeMessage('unsubscribe')
  unsubscibe(@MessageBody() currencyPair: string) {
    const subscribeObj = {
      event: 'bts:unsubscribe',
      data: {
        channel: `live_orders_${currencyPair}`,
      },
    };
    this.bitstampWs.send(JSON.stringify(subscribeObj));
    this.bitstampWs.on('message', (message: string) => {
      const data = JSON.parse(message);
      this.server.emit('price', {
        price: data.data.price,
      });
    });
  }

  @SubscribeMessage('ohlc')
  subscribeOhlc(@MessageBody() currentPair: string) {
    this.getOhlc(currentPair);
  }

  async getOhlc(currencyPair: string) {
    const ohlc = await this.streamingService.getOhlc(currencyPair);
    this.server.emit('ohlc', {
      open: ohlc[0].open,
      high: ohlc[0].high,
      low: ohlc[0].low,
      close: ohlc[0].close,
    });
    setTimeout(() => {
      this.getOhlc(currencyPair);
    }, 60000);
  }
}
