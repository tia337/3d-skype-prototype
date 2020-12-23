import { forwardRef, HttpModule, Module } from '@nestjs/common';
import {EventBusGateway} from './eventbus.service';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    EventBusGateway,
  ],
  exports: [EventBusGateway],
})
export class EventbusModule {}
