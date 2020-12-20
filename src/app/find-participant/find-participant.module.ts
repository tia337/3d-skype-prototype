import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FindParticipantRoutingModule } from './find-participant-routing.module';
import { FindParticipantComponent } from './find-participant.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [FindParticipantComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FindParticipantRoutingModule
  ]
})
export class FindParticipantModule { }
