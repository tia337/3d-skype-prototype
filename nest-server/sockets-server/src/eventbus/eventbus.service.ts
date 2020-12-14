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
import {User} from "./interfaces/user.interface";

let i = 1;
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
    try {
      console.log('-------')
      this.clients.push({
        id: i,
        client
      });
      console.log()
      client.emit('yourID', i);
      i++;
    } catch (e) {
      // client.emit('InvalidToken', {
      //   type: 'exception',
      //   message: `Client ${client.id} has encountered an error: ${e.message}`,
      // });
    }
  }

  public async handleDisconnect(client: Socket) {
    // try {
    //   const { contractId } = await this.getClientIdentity(client);
    //   this.logger.log(`Client, with contract: ${contractId} has disconnected.`);
    //   this.socketStorageService.remove(contractId, client.id);
    // } catch (e) {
    //   this.logger.log(`Client ${client.id} encountered an error: ${e.message}`);
    // }
  }

  @SubscribeMessage('CallUser')
  async onCallUser(
    client: any,
    payload: any,
  ) {
    payload = JSON.parse(JSON.stringify(payload));
    console.log(payload.userToCall)
    console.log(this.clients)
    const callUser = this.clients.find(el => el.id == payload.userToCall);
    console.log(callUser)
    callUser.client.emit('hey', {signal: payload.signalData, from: payload.from});
    // return this.websocketResponse(event);
  }

  @SubscribeMessage('acceptCall')
  async onAcceptCall(
    client: any,
    payload: any,
  ) {
    console.log(payload);
    payload = JSON.parse(JSON.stringify(payload));
    console.log(payload.to)

    const callUser = this.clients.find(el => el.id == payload.to);
    callUser.client.emit('callAccepted', payload.signal);
    // io.to(data.to).emit("callAccepted", data.signal);
  }

  // private websocketResponse() {
  //   return {
  //     data: { tr: 'tr' },
  //   };
  // }

  //
  // /**
  //  * @description This event listener is used to listen on EthereumAccounts events and emit EthereumAccountsEvent event to kafka
  //  * Returns ethereum account information
  //  * @param {Client} client websocket client information
  //  * @param {Object} payload event payload
  //  * @return {Promise<{ status: EventStatuses, data: {}}>}
  //  */
  // @SubscribeMessage('EthereumAccounts')
  // async onEthereumAccountsEventReceived(
  //   client: Client,
  //   payload: any,
  // ): Promise<WsResponse<any>> {
  //   const ethereumAccountsEvent = new EthereumAccountsEvent(payload);
  //   ethereumAccountsEvent.setPayload(payload).setMetadata(payload);
  //   try {
  //     await this.emit(ethereumAccountsEvent);
  //   } catch (e) {
  //     this.logger.error(`There is problem with Kafka: ${e.message}`);
  //     throw new SystemCriticalExteption(e);
  //   }
  //   return this.websocketResponse(ethereumAccountsEvent);
  // }
  //
  // /**
  //  * @description This event listener is used to listen on CustomerClients events and emit CustomerClientsEvent event to kafka
  //  * Returns user clients (by permissions)
  //  * @param {Client} client websocket client information
  //  * @param {Object} payload event payload
  //  * @return {Promise<{ status: EventStatuses, data: {}}>}
  //  */
  // @SubscribeMessage('CustomerClients')
  // async onCustomerClientsEventReceived(
  //   client: Client,
  //   payload: any,
  // ): Promise<WsResponse<any>> {
  //   this.logger.log(`Socket. CustomerClients. ${JSON.stringify(payload)}`);
  //   const customerClientsEvent = new CustomerClientsEvent(payload);
  //   try {
  //     await this.emit(customerClientsEvent);
  //   } catch (e) {
  //     this.logger.error(`There is problem with Kafka: ${e.message}`);
  //     throw new SystemCriticalExteption(e);
  //   }
  //   return this.websocketResponse(customerClientsEvent);
  // }
  //
  // /**
  //  * @description This event listener is used to listen on CustomerFiatAccounts events and emit CustomerFiatAccountsEvent event to kafka
  //  * Returns user fiat accounts
  //  * @param {Client} client websocket client information
  //  * @param {Object} payload event payload
  //  * @return {Promise<{ status: EventStatuses, data: {}}>}
  //  */
  // @SubscribeMessage('CustomerFiatAccounts')
  // async onCustomerFiatAccountsRequest(client: Client, payload: any) {
  //   const customerClientsEvent = new CustomerFiatAccountsEvent(payload);
  //   try {
  //     await this.emit(customerClientsEvent);
  //   } catch (e) {
  //     this.logger.error(`There is problem with Kafka: ${e.message}`);
  //     throw new SystemCriticalExteption(e);
  //   }
  //   return this.websocketResponse(customerClientsEvent);
  // }
  //
  // /**
  //  * @description This event listener is used to listen on Order create events and emit OrderCreate event to kafka
  //  * Creates new order
  //  * @param {OrderCreateDto} payload order payload
  //  * @return {Promise<{ status: EventStatuses, data: {}}>}
  //  */
  // @UsePipes(new EventBusValidationPipe())
  // @UseGuards(IsWhitelistAddressGuard)
  // @SubscribeMessage('OrderCreate')
  // async onOrderBuyEventReceived(@MessageBody() payload: OrderCreateDto) {
  //   const orderCreateEvent = new OrderCreateEvent({
  //     ...payload['data'],
  //     privateKeys: payload['privateKeys'],
  //     contractId: payload['contractId'],
  //   });
  //   try {
  //     await this.emit(orderCreateEvent);
  //   } catch (e) {
  //     this.logger.error(`There is problem with Kafka: ${e.message}`);
  //     throw new SystemCriticalExteption(e);
  //   }
  //   return this.websocketResponse(orderCreateEvent);
  // }
  //
  // /**
  //  * @description This event listener is used to listen on BankingFee events and emit BankingFeeEvent event to kafka
  //  * Returns banking fee
  //  * @param {Client} client websocket client information
  //  * @param {Object} payload event payload
  //  * @return {Promise<{ status: EventStatuses, data: {}}>}
  //  */
  // @SubscribeMessage('BankingFee')
  // async onFeeEventReceived(client: Client, payload: any) {
  //   const orderFee = new BankingFeeEvent(payload);
  //   try {
  //     await this.emit(orderFee);
  //   } catch (e) {
  //     this.logger.error(`There is problem with Kafka: ${e.message}`);
  //     throw new SystemCriticalExteption(e);
  //   }
  //   return this.websocketResponse(orderFee);
  // }
  //
  // /**
  //  * @description This function used to send events to Kafka or websocket listener
  //  * @param {EventInterface} event event data
  //  */
  // public async emit(event: EventInterface): Promise<void> {
  //   switch (event.transport) {
  //     case EventTransport.websocket: {
  //       if (event?.contractId) {
  //         this.sendToUser(event.contractId, event);
  //       } else {
  //         this.logger.error(
  //           `Client contract ${event.contractId} is not found!`,
  //         );
  //         this.logger.debug({ event });
  //       }
  //
  //       break;
  //     }
  //     case EventTransport.kafka: {
  //       await this.kafkaService.send(event);
  //       break;
  //     }
  //     default:
  //       this.logger.error(`Invalid event type!: ${event.type}`);
  //   }
  // }
  //
  // private async sendToUser(
  //   contractId: string,
  //   event: EventInterface,
  // ): Promise<void> {
  //   const socketIds = await this.socketStorageService.getSocketsByContractId(
  //     contractId,
  //   );
  //   if (socketIds.length === 0) {
  //     return;
  //   }
  //   const payload = {
  //     status: event.status,
  //     data: event.payload,
  //   };
  //   socketIds.forEach(socketId => {
  //     this.server.to(socketId).emit(event.topic, payload);
  //     this.logger.log(
  //       `Event ${event.topic} has emitted to user: ${contractId} to socket: ${socketId}`,
  //     );
  //   });
  // }
  //
  // private websocketResponse(event: EventInterface) {
  //   const data = Object.assign({}, event.payload);
  //   delete data.privateKeys;
  //   return {
  //     event: event.topic,
  //     data: { status: event.status, data },
  //   };
  // }
  //
  //
  // private async removeUnusedSockets() {
  //   const contractIds = await this.socketStorageService.getAllContractIds();
  //   contractIds.forEach(async contractId => {
  //     const sockets = await this.socketStorageService.getSocketsByContractId(
  //       contractId,
  //     );
  //
  //     sockets.forEach(socket => {
  //       if (
  //         !this.server.sockets.sockets ||
  //         !this.server.sockets.sockets[socket] ||
  //         !this.server.sockets.sockets[socket].connected
  //       ) {
  //         this.socketStorageService.remove(contractId, socket);
  //       }
  //     });
  //   });
  // }
}
