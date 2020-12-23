import {
  Injectable,
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway(8888, {
  path: '/api',
  namespace: '/api',
  pingInterval: 2000,
})
export class EventBusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger;
  private clients: any[];
  @WebSocketServer() server: Server;
  constructor(
  ) {
    this.logger = new Logger(EventBusGateway.name);
    this.clients = [];
  }

  async afterInit(server: Server) {
    this.logger.log(`Websocket server is initialized`);
  }

  public async handleConnection(client: Socket) {
    console.log('----')
      this.clients.push({
        id: JSON.parse(JSON.stringify(client.handshake.query)).id,
        client
      });
    console.log(this.clients)
  }

  public async handleDisconnect(client: Socket) {
    this.clients = this.clients.filter(el => el.client.id !== client.id);
  }

  @SubscribeMessage('UserCallRequest')
  async onuserCallRequest(
    client: any,
    payload: any,
  ) {
    payload = JSON.parse(JSON.stringify(payload));
    const callUser = this.clients.find(el => el.id == payload.to);
    console.log('--=-=-=---', payload.to);
    callUser.client.emit('userCall', {from: payload.from, to: payload.userToCall, email: payload.email});
  }

  @SubscribeMessage('CallUser')
  async onCallUser(
    client: any,
    payload: any,
  ) {
    payload = JSON.parse(JSON.stringify(payload));
    const callUser = this.clients.find(el => el.id == payload.userToCall);
    callUser.client.emit('hey', {signal: payload.signalData, from: payload.from, to: payload.userToCall});
  }

  @SubscribeMessage('CallEnd')
  async onCallEnd(
    client: any,
    payload: any,
  ) {
    payload = JSON.parse(JSON.stringify(payload));
    const callUser = this.clients.find(el => el.id == payload.to);
    console.log('00----', payload)
    callUser.client.emit('cancelCall', {from: payload.from});
  }

  @SubscribeMessage('AcceptCall')
  async onAcceptCall(
    client: any,
    payload: any,
  ) {
    console.log('----AcceptCall', payload.to)
    payload = JSON.parse(JSON.stringify(payload));
    console.log(this.clients)
    const callUser = this.clients.find(el => el.id == payload.to);

    callUser.client.emit('callAccepted', payload.signal);
  }

}
