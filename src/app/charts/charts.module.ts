import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartsRoutingModule } from './charts-routing.module';
import { ChartsComponent } from './charts.component';
import { SumchartsComponent } from './sumcharts/sumcharts.component';
import {SharedModule} from "../shared/shared.module"
import { ChartsService } from './charts.service';
import { DetailedComponent } from './detailed/detailed.component';


@NgModule({
  declarations: [ChartsComponent, SumchartsComponent, DetailedComponent],
  imports: [
    CommonModule,
    ChartsRoutingModule,
    SharedModule,
  ],
  providers:[ChartsService]
})
export class ChartsModule { }
