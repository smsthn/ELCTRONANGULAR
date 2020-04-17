import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChartsComponent } from './charts.component';
import { SumchartsComponent } from './sumcharts/sumcharts.component';
import { DetailedComponent } from './detailed/detailed.component';

const routes: Routes = [{
  path: '',

  component: ChartsComponent,
  children: [
    {
      path: '',
      redirectTo: 'sum',
      pathMatch: 'full',
    },
    {
      path: 'sum',
      component: SumchartsComponent
    },
    {
      path: 'detailed',
      component: DetailedComponent
    },
  ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartsRoutingModule { }
