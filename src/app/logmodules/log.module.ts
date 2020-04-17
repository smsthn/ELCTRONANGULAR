import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogComponent } from './log/log.component';
import { DayComponent, DeleteLogComponent } from './day/day.component';
import { MonthComponent } from './month/month.component';

import { LogRoutingModule } from './log-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from '../shared/shared.module';
import { LogMainComponent } from './log.main.component';
import { ActionComponent } from './action/action.component';
import * as Hammer from "hammerjs";
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: Hammer.DIRETION_ALLL }
  };
}


@NgModule({
  declarations: [ LogComponent, DayComponent, MonthComponent, LogMainComponent, ActionComponent, DeleteLogComponent],
  imports: [
    HammerModule,
    CommonModule,
    LogRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SharedModule,
    DragDropModule,
  ],
  providers: [MatDatepickerModule, MatNativeDateModule,{
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerGestureConfig
    }],

})
export class LogModule { }
