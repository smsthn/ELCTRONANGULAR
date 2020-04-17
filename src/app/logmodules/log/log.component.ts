import { Component, OnInit, Inject, ViewChild, OnDestroy, Optional, ChangeDetectorRef } from '@angular/core';

import { LogService } from '../../services/log.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogData, LogColor, numAsDate, LAA } from '../../data/log.data';

import { ActionType, Action as la } from '../../data/action';
import { ActionSubject } from '../../data/action.subject';
import { Category } from '../../data/category';
import { Keyword } from '../../data/keyword';
import { trigger, transition, style, animate } from '@angular/animations';
import { NumberFromLogDate, LogDate, NumberToTime, NumberToMinutes } from '../../data/log.date';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, delay } from 'rxjs/operators';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

const electron = (<any>window).require('electron');
import * as _moment from 'moment';
import { defaultFormat as _rollupMoment } from 'moment';
import { IpcRenderer, ipcRenderer } from 'electron';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';


const moment = _rollupMoment || _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0 }),
            animate('50ms ease-out',
              style({ height: 50 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 50 }),
            animate('50ms ease-in',
              style({ height: 0 }))
          ]
        )
      ]
    )
  ]
})


export class LogComponent implements OnInit, OnDestroy {
  log: LogData;

  creaingActionSubject: boolean = false;
  private deleted: boolean = false;
  laa: LAA;
  category: Category;
  allCategories: Category[];
  keywords: Keyword[];
  logcolor: LogColor = LogColor.pink;
  logColors = [LogColor.red, LogColor.yellow, LogColor.lightblue, LogColor.blue, LogColor.purple, LogColor.pink,
  LogColor.white, LogColor.bluegray, LogColor.orange, LogColor.green, LogColor.darkgreen,];
  colors = ["#FB234A", "#D9CC46", "#5DA4C5", "#0048FF", "#A833FF", "#FF0079", "#fafafa", "#5F7D8A",
    "#D15950", "#008D7B", "#008600",];

  displayHStart: string = "00"; displayHEnd: string = "00";
  displayMStart: string = "00"; displayMEnd: string = "00";

  timeStart: number = 0; timeEnd: number = 0;
  daymin: number = 24 * 60;
  startDate: _moment.Moment; endDate: _moment.Moment;
  isEdit: boolean = false;
  maxDate: Date = new Date(Date.now());
  maxTimeStart: number;
  maxTimeEnd: number;

  private ipc = electron.ipcRenderer;
  constructor(
    private matIconRegistry: MatIconRegistry,
    private ds: DomSanitizer,
    private logService: LogService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public diagRef: MatDialogRef<LogComponent>,
    private ref: ChangeDetectorRef,
  ) {
    let dss: LogDate = { year: 123, month: 1234, day: 12321 };
    this.initLog();
    this._updateMaxTime();
    setInterval(
      this._updateMaxTime, (1000 * 60 * 15)
    );
  }


  ngOnInit(): void {
    ipcRenderer.on('added_category', (evt, res) => {
      ipcRenderer.send('get_categories');
      this, this.log.category_id = res[0];
      var setCtg = setInterval(() => {
        if (this.allCategories.find(ctg => ctg.id === res[0])) {
          this.category = this.allCategories.find(ctg => ctg.id === res[0]);
          clearInterval(setCtg);
        }
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    if (!this.deleted) {
      if (this.isEdit) {
        if (this.log.title || (this.log.note)) {
          if (this.log.is_action && !this.log.title) this.log.is_action = false;
          this.logService.updateLog(this.log);
        } else {
          this.logService.deleteLog(this.log);
        }
      } else {
        if (this.log.title || this.log.note) {
          this.logService.toAdd.log = this.log;
          this.logService.tryAddLog();
        }
      }
    }
  }

  private initLog() {
    this.log = this.data.log ?
      { ...this.data.log, is_timed: !!this.data.log.is_timed, is_action: !!this.data.log.is_action }
      : null;

    var now = _moment();
    var num = now.toDate().toNumber();//NumberFromLogDate(new LogDate(now.toDate()));
    var time = (now.hour() * 100) + now.minute();
    if (!this.log) {
      this.isEdit = false; var d = this.data.date; now = _moment(new Date(d.year, d.month - 1, d.day));
      //num = now.toDate().toNumber()//NumberFromLogDate(new LogDate(now.toDate()));
      this.log = new LogData(-1, 1, '', '', false, false, time, time, num, num, LogColor.pink);
      this.logService.toAdd = { log: this.log, action: null, actsbj: null, actionDetails: '' };
      this.laa = { log_id: this.log.id, }; this.logService.toAdd.actionDetails = this.laa.details;

    } else {
      this.isEdit = true;
      this.timeStart = NumberToMinutes(this.log.start_time) / 15;
      if (!this.timeStart) this.timeStart = 0;
      this.timeEnd = NumberToMinutes(this.log.end_time) / 15;
      if (!this.timeEnd) this.timeEnd = this.timeStart + 1;

    }
    this.startDate = this.log ? _moment(numAsDate(this.log.start_date)) : _moment();
    this.endDate = this.log ? _moment(numAsDate(this.log.end_date)) : _moment();
    //const s = this.endDate.toLocaleDateString();


    this.logService.getCategories().subscribe(ctgs => this.allCategories = ctgs);
    if (this.log) this.category = this.allCategories.find(c => this.log.category_id === c.id);
    else this.category = this.allCategories[0];
    this.logcolor = this.log ? this.log.color : this.logColors[0];
    if (this.log) {
      this.changeTime({ value: (Math.floor(NumberToMinutes(this.log.start_time) / 15)) });
      if (this.log.end_time) this.changeTime({
        value: (NumberToMinutes(this.log.end_time) / 15)
      }, false);
    }

    this.matIconRegistry.addSvgIcon(
      'delete36w',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/delete-white-36.svg"),
    );
    this.matIconRegistry.addSvgIcon(
      'count18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/count-18.svg"),
    );
    this.matIconRegistry.addSvgIcon(
      'sum18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/sum-18.svg"),
    );
  }


  changeLogColor(i: number) {
    this.log.color = this.logColors[i]; this.logcolor = this.logColors[i];
  }
  private timeout;
  changeTime(event, start: boolean = true, ignoreChecks: boolean = false) {
    let num = Math.round(Math.min(event.value as number, this.log.is_timed ? ((24 * 4) - 2) : ((24 * 4) - 1)));
    //this._updateMaxTime();
    if (start && num > this.maxTimeStart - 1 || !start && num > this.maxTimeEnd + 1 || !start && num < 1) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if ((start && this.timeStart > this.maxTimeStart - 1 ||
          !start && this.timeEnd > this.maxTimeEnd + 1 || !start && this.timeEnd < 1)) {
          this
            .changeTime({ value: start ? this.maxTimeStart - 1 : (this.timeEnd < 1 ? 1 : this.maxTimeEnd + 1) },
              start, ignoreChecks);
        } else {
          clearTimeout(this.timeout);
        }

      }, 200);
      return;
    }

    if (start) this.timeStart = num;
    else this.timeEnd = num;
    num *= 15;
    if (start) this.log.start_time = (Math.floor(num / 60) * 100) + num % 60;
    else this.log.end_time = (Math.floor(num / 60) * 100) + num % 60;

    const change = this.oneDay() && this.log.start_time >= this.log.end_time;
    this.timesToStrings(start);
    if (change && !ignoreChecks) {
      if (start) this.changeTime({ value: Math.min(event.value + 4, ((24 * 4) - 1)) }, !start, true);
      else this.changeTime({ value: Math.max(0, event.value - 4) }, !start, true);
    }
  }
  private oneDay() {
    return this.startDate.toDate().toNumber() === this.endDate.toDate().toNumber();
  }
  private timesToStrings(start: boolean = true) {
    if (start) {
      var h = Math.floor(this.log.start_time / 100).toString();
      var m = Math.floor(this.log.start_time % 100).toString();
      h = h.length === 1 ? '0' + h : h; m = m.length === 1 ? '0' + m : m;
      this.displayHStart = h; this.displayMStart = m;
    } else {
      var h = Math.floor(this.log.end_time / 100).toString();
      var m = Math.floor(this.log.end_time % 100).toString();
      h = h.length === 1 ? '0' + h : h; m = m.length === 1 ? '0' + m : m;
      this.displayHEnd = h; this.displayMEnd = m;
    }

  }
  timeScroll(event, start: boolean = true, hours: boolean = true) {
    const changeValue = (-1 * Math.sign(event.deltaY) * (hours ? 4 : 1)) + this.timeStart;
    const clampedTime = Math.min(95, (Math.max(0, changeValue)));
    this.changeTime({ value: clampedTime }, start);
  }
  changeLogType() {
    this.log.is_action = !this.log.is_action;
  }
  changeTimed() {
    this.log.is_timed = !this.log.is_timed;
    this.changeTime({ value: this.timeStart });
  }
  changeDate(start: boolean = true) {
    var now = _moment();
    if (start && this.startDate > _moment().add(-1, 'days')) {
      this.startDate = _moment();
      this._updateMaxTime();
      if (this.timeEnd > this.maxTimeEnd) { this.changeTime({ value: this.maxTimeEnd }, false) }
      if (this.timeStart >= this.timeEnd) { this.changeTime({ value: this.timeEnd - 2 }) }
      return;
    }
    if (!start && this.endDate > _moment()) {
      this.endDate = _moment(); return;
    }
    if (start) this.log.start_date = this.startDate.toDate().toNumber();
    else this.log.end_date = this.endDate.toDate().toNumber();
    if (this.log.start_date > this.log.end_date) {
      if (start) {
        this.log.end_date = this.log.start_date;
        this.endDate = _moment(numAsDate(this.log.end_date));
      }
      else {
        this.log.start_date = this.log.end_date;
        this.startDate = _moment(numAsDate(this.log.start_date));
      }
    }
    this._updateMaxTime();
    if (this.log.start_date === this.log.end_date) {
      this.changeTime({ value: this.timeStart });
    }
  }
  changeCategory() {
    this.log.category_id = this.category.id;
  }

  addCtg($event: KeyboardEvent, ctg: string): boolean {
    if ($event.key === "Enter") {
      if (ctg) {
        this.logService.addCategory(ctg);
      }
      return true;
    }
    if ($event.code === "Space") {
      //$event.preventDefault();
      $event.stopPropagation();
    }
    return false;
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  changeTitle(event) {
    this.log.title = event;
  }

  deleteLog() {
    this.deleted = true;
    if (this.isEdit) {
      this.logService.deleteLog(this.log);
    }

    this.diagRef.close();
  }
  private _updateMaxTime() {
    const time = _moment();
    const s = this.startDate; const e = this.endDate;
    const h = time.hour(); const m = time.minute();
    const time15 = Math.round((h * 4) + (m / 15));

    if ((s.year() * 10000) + (s.month() * 100) + s.date() <
      (time.year() * 10000) + (time.month() * 100) + time.date()) {
      this.maxTimeStart = 95;
    } else {
      this.maxTimeStart = time15;
    }

    if ((e.year() * 10000) + (e.month() * 100) + e.date() <
      (time.year() * 10000) + (time.month() * 100) + time.date()) {
      this.maxTimeEnd = 96;
    } else {
      this.maxTimeEnd = time15;
    }
    if (this.timeStart > this.maxTimeStart - 1) this.changeTime({ value: this.maxTimeStart - 1},true,true);
    if (this.timeEnd > this.maxTimeEnd + 1) this.changeTime({ value: this.maxTimeEnd + 1 }, false, true);
  }
}


declare global {
  interface Date {
    toNumber(): number;
  }

}
Date.prototype.toNumber = function (): number {
  return (this.getFullYear() * 10000) + ((this.getMonth() + 1) * 100) + this.getDate();
}
// export interface CustomDate {
//   date: {
//     year: number; month: number; day: number;
//   }
// }



