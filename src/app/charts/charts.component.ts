import { Component, OnInit, NgZone } from '@angular/core';
import { Action } from '../data/action';
import { Keyword } from '../data/keyword';
import { Category } from '../data/category';
import { ChartsService, ISelectedAction } from './charts.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ipcRenderer } from 'electron';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LogService } from '../services/log.service';
import * as _moment from 'moment';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../logmodules/log/log.component';
import {Location} from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ChartsComponent implements OnInit {
  private str = [
    'one_action', 'many_actions', 'all_actions',
    'one_action_with_categories', 'many_actions_with_categories', 'all_actions_with_categories',
    'one_actionwith_keywords', 'many_actionswith_keywords', 'all_actionswith_keywords',
    'one_actionwith_categories_keywords', 'many_actionswith_categories_keywords', 'all_actionswith_categories_keywords',];

  loading: boolean = true;
  allData$: Observable<ISelectedAction[] | Category[] | Keyword[]>;
  selectedActions$: Observable<ISelectedAction[]>;
  selectedCategories$: Observable<Category[]>;
  selectedKeywords$: Observable<Keyword[]>;
  viewPeriod: 'this_week' | 'this_month' | 'this_year' | 'custom' = 'this_week';
  from: Date;
  till: Date;
  readonly maxDate: _moment.Moment = _moment();

  currentView: 'Sum' | 'Time' | 'Count' | 'Detailed' = 'Time';
  previousView: 'Sum' | 'Time' | 'Count' | 'Detailed' = 'Time';

  constructor(
    private chartService: ChartsService,
    private zone: NgZone,
    private router: Router,
    private location: Location,
    private iconReg: MatIconRegistry,
    private ds: DomSanitizer,

  ) {
    this.str.forEach(s => ipcRenderer.on(s, () => { this.loading = false }));
  }
  chartType: 'action' | 'category' | 'keyword' = 'action';

  ngOnInit(): void {
    this.allData$ = this.chartService.getAllData();
    this.selectedActions$ = this.chartService.selectedActions.asObservable();
    this.selectedCategories$ = this.chartService.selectedCategories.asObservable();
    this.selectedKeywords$ = this.chartService.selectedKeywords.asObservable();
    this.from = this.chartService.duration.value.from;
    this.till = this.chartService.duration.value.till;
    this.iconReg.addSvgIcon(
      'cancel18',
      this.ds.bypassSecurityTrustResourceUrl(`/assets/icons/cancel-18.svg`),
    );

    this.router.events.forEach(
      e => {
        if (e instanceof NavigationEnd) {
          if (e.urlAfterRedirects.includes('detailed')) {
            this.previousView = this.currentView;
            this.currentView = 'Detailed';
          } else {
            if (this.currentView === 'Detailed') {
              this.currentView = this.previousView;
            }
          }
        }
      }
    );
    ipcRenderer.on('got_log_and_laa_subj_for_action', (evt, res) => {
      this.loading = false;
      this.router.navigateByUrl("/charts/detailed", {})
      this.chartService.detailedData = res;

    })
    setTimeout(() => {
      this.loading = false;
    }, 2000);

  }

  //TODO: CONVERT INTO METHODS INSTEAD OF ACCESSING SERVICE DIRECTLY TODO:\\
  chartTypeChanged(event?: MatButtonToggleChange) {
    if (this.chartType === 'action') {
      this.chartService.getAllActions();
    } else if (this.chartType === 'category') {
      this.chartService.getAllCategories();
    } else {
      this.chartService.getAllKeywords();
    }
  }
  selectItem(item) {
    if (this.chartType === 'action') {
      this.chartService.selectedActions.next([...this.chartService.selectedActions.value, item]);
    } else if (this.chartType === 'category') {
      this.chartService.selectedCategories.next([...this.chartService.selectedCategories.value, item]);
    } else {
      this.chartService.selectedKeywords.next([...this.chartService.selectedKeywords.value, item]);
    }

    this.chartService.selectItem(item);

  }
  unselectItem(item, type: string) {
    if (type === 'action') {
      this.chartService.selectedActions.next(this.chartService.selectedActions.value.filter(a => a !== item));
    } else if (type === 'category') {
      this.chartService.selectedCategories.next(this.chartService.selectedCategories.value.filter(a => a !== item));
    } else {
      this.chartService.selectedKeywords.next(this.chartService.selectedKeywords.value.filter(a => a !== item));
    }

    this.chartService.unselectItem(item, type);
    this.chartTypeChanged()
  }
  unselect_all(type: string) {
    if (type === 'action') {
      if (this.chartService.selectedActions.value.length === 0) return;
      this.chartService.selectedActions.next([]);
    } else if (type === 'category') {
      if (this.chartService.selectedCategories.value.length === 0) return;
      this.chartService.selectedCategories.next([]);
    } else {
      if (this.chartService.selectedKeywords.value.length === 0) return;
      this.chartService.selectedKeywords.next([]);
    }
    this.chartService.unselectAll(type)
    this.chartTypeChanged()
  }
  ChangeViewPeriod() {
    switch (this.viewPeriod) {
      case 'this_week':
        this.from = _moment().startOf('week').toDate();
        break;
      case 'this_month':
        this.from = _moment().startOf('month').toDate();
        break;
      case 'this_year':
        this.from = _moment().startOf('year').toDate();
        break;
      default:
        return;
    }
    this.till = _moment().toDate();
    this.changeDate();
  }
  changeDate() {
    this.loading = true;
    this.chartService.duration.next({ from: this.from, till: this.till });
  }
  ChangeViewType(event) {
    this.chartService.changeViewType(this.currentView)
    this.loading = true;
    setTimeout(()=>{this.loading = false},1500)
  }
}
// export enum ChartDisplayType {
//   All = "All",
//   Keyword = "Keyword",
//   Action = "Action",
//   ActionAndKeyword = "ActionAndKeyword",
//   Category = "Category",
//   ActionAndCategory = "ActionAndCategory",
//   CategoryAndKeyword = "CategoryAndKeyword"
// }


// export interface ChartViewData {
//   main?: Action | Category | Keyword,
//   sub?: Action[] | Category[] | Keyword[],
//   extra?: Action[] | Category[] | Keyword[],
// }
