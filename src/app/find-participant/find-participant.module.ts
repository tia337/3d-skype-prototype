import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FindParticipantRoutingModule } from './find-participant-routing.module';
import { FindParticipantComponent } from './find-participant.component';


@NgModule({
  declarations: [FindParticipantComponent],
  imports: [
    CommonModule,
    FindParticipantRoutingModule
  ]
})
export class FindParticipantModule { }
