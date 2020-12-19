import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoCallComponent } from './video-call.component';
const routes: Routes = [
  {
    path: '', component: VideoCallComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoCallRoutingModule { }
