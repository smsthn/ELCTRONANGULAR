import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { MatModuleModule } from '../mat-module/mat-module.module';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [CommonModule,MatModuleModule, TranslateModule, FormsModule],
  exports: [TranslateModule,MatModuleModule, WebviewDirective, FormsModule]
})
export class SharedModule {}
