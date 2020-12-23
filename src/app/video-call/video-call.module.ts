import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoCallRoutingModule } from './video-call-routing.module';
import { VideoCallComponent } from './video-call.component';
import {ReactiveFormsModule} from "@angular/forms";
import {AccountModule} from "../account/account.module";

@NgModule({
  declarations: [VideoCallComponent],
  imports: [
    CommonModule,
    VideoCallRoutingModule,
    ReactiveFormsModule,
    AccountModule
  ]
})
export class VideoCallModule { }
