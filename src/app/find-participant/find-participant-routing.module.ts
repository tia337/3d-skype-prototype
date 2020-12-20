import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindParticipantComponent } from './find-participant.component';
const routes: Routes = [
  {
    path: '', component: FindParticipantComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FindParticipantRoutingModule { }
