import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DayComponent } from './day/day.component';
import { MonthComponent } from './month/month.component';
import { LogMainComponent } from './log.main.component';


const logRoutes: Routes = [
  {
    path: 'logs',
    component: LogMainComponent,
    children: [
      {
        path: '',
        redirectTo: 'month',
        pathMatch: 'full',
      },
      {
        path: 'month',
        component: MonthComponent,
        data: { animation: 'MonthPage' }
      },
      {
        path: 'day',
        component: DayComponent,
        data: { animation: 'DayPage' }
      },
    ],
  },


];

@NgModule({
  imports: [RouterModule.forChild(logRoutes)],
  exports: [RouterModule]
})
export class LogRoutingModule { }
