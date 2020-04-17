import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';
import { MonthComponent } from './logmodules/month/month.component';
import { LogMainComponent } from './logmodules/log.main.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'logs',
    pathMatch: 'full',
  },

  { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule) },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
