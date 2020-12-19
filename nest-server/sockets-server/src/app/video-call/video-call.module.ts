import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoCallRoutingModule } from './video-call-routing.module';
import { VideoCallComponent } from './video-call.component';


@NgModule({
  declarations: [VideoCallComponent],
  imports: [
    CommonModule,
    VideoCallRoutingModule
  ]
})
export class VideoCallModule { }
