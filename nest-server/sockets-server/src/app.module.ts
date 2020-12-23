import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {EventbusModule} from "./eventbus/eventbus.module";

@Module({
  imports: [EventbusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
