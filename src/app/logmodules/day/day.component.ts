import { Component, OnInit, Inject, } from '@angular/core';
import { LogData } from '../../data/log.data';
import { LogDate, StringFromLogDate, DateStringFromLog, addDay, compareLogDates, DateFromLogDate } from '../../data/log.date';
import { LogService } from '../../services/log.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser"
import * as _moment from 'moment';
import { HostListener } from "@angular/core";




import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LogComponent } from '../log/log.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { BlockScrollStrategy, ScrollStrategyOptions, CloseScrollStrategy } from '@angular/cdk/overlay';
import { ipcRenderer } from 'electron';
import { CdkDragDrop } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ transform: 'translateY(200%)' }),
            animate('200ms linear',
              style({ transform: 'none' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ transform: 'none' }),
            animate('100ms linear',
              style({ transform: 'translateY(-200%)', opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class DayComponent implements OnInit {
  readonly monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  readonly weekDays:string[]=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  readonly years: number[] = Array(1000).fill(2020).map((v, i) => v - i);
  private dateTimeout;


  constructor(private logService: LogService, public dialog: MatDialog,
    private ds: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private route: ActivatedRoute,
    private router: Router) { this.getScreenSize(); }
  private screenHeight: number;
  private screenWidth: number;
  logs$: Observable<LogData[]>;
  logDate: BehaviorSubject<LogDate>;
  readonly maxDate: Date = new Date(Date.now());
  readonly logToDate = DateStringFromLog;

  ngOnInit(): void {
    ipcRenderer.on('deleted_log', (evt, res) => {
      this.logs$ = this.logService.getDayLogs(this.logDate.value);
    });
    this.initIcons();
    this.logService.currentLogDate$.subscribe(
      ld => {
        if (this.logDate) {
          return this.logDate.next({ ...ld});
        } else {
          return this.logDate = new BehaviorSubject<LogDate>({ ...ld});
        }
      }
    );
    this.logs$ = this.logService.getDayLogs(this.logDate.value);
  }
  private initIcons() {
    this.matIconRegistry.addSvgIcon(
      'time18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/time-18.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'note18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/note-18.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'action18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/action-18.svg")
    );
  }
  getDayName() {
    return this.weekDays[(_moment(DateFromLogDate(this.logDate.value)).weekday() + 1) % 7];
  }
  openDialog(logId: number) {
    this.logService.getLog(logId);
  }
  drop(event: CdkDragDrop<LogData[]>) {
    if (event.distance.x >= Math.min(this.screenWidth / 2, 1200 / 2)) {
      this.dialog.open(DeleteLogComponent, { data: { log: event.container.data[event.previousIndex]}})
    }
  }
  changeYear(event) {
    this.dateEnterPressed(event);
  }
  changeMonth(event) {
    this.dateEnterPressed(event);
  }
  private dateEnterPressed(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'Return') {
      this.changeDateTimeout(0);
    } else {
      this.changeDateTimeout(3000);
    }
  }
  private changeDateTimeout(time: number) {
    clearTimeout(this.dateTimeout);
    this.dateTimeout = setTimeout(() => {
      this.logService.changeDate({ ...this.logDate.value});
    }, time)
  }
  mouseWheelEvent(event, type: 'year' | 'month'|'day') {
    type === 'year' ? (this.logDate.value.year -= Math.sign(event.deltaY)) :
      (type === 'month' ? (this.logDate.value.month -= Math.sign(event.deltaY)) :
        (this.logDate.value.day -= Math.sign(event.deltaY)));
    this.clampDate()
    return this.changeDateTimeout(100);
  }
  private isNow(): boolean {
    const now = _moment();
    const md = this.logDate.value;
    return md.year === now.year() && md.month === now.month() + 1 && md.day === now.date();
  }
  private isLater(): boolean {
    const now = _moment();
    const md = this.logDate.value;
    return md.year > now.year() || (md.year === now.year() && md.month > now.month() + 1)
      || (md.year === now.year() && md.month === now.month() + 1 && md.day > now.date());
  }
  private clampDate(change: boolean = true) {
    const now = _moment();
    const md = this.logDate.value;
    const mmd = _moment(DateFromLogDate({ ...md,day:1}));
    const nl = this.isNow() || this.isLater();
    const l = this.isLater();
    const newd = md.day.clamp(1, nl ? now.date() : mmd.daysInMonth(), change && !l);
    if (change && !l) md.month += Math.sign(md.day - newd)
    const newm = md.month.clamp(1, nl ? now.month() + 1 : 12, change && !l);
    if (change && !l) md.year += Math.sign(md.month - newm);
    md.day = newd;
    md.month = newm;
    md.year = md.year.clamp(1900, now.year());
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
   // console.log(this.screenHeight, this.screenWidth);
  }

}


@Component({
  selector: 'delete-log-dialog',
  templateUrl: './delete.log.dialog.html'
})
export class DeleteLogComponent implements OnInit {
  /**
   *
   */
  constructor(
    public dialogRef: MatDialogRef<DeleteLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private logService: LogService
  ) {

   }
  ngOnInit(): void {
    this.log = this.data.log;
  }
  log: LogData;
  deleteLog() {
    this.logService.deleteLog(this.log);
    this.dialogRef.close();
  }
  closeDialog() {
    this.dialogRef.close();
  }
}


declare global {
  interface Number {
    clamp(num1: number, num2: number, reverse?: boolean): number;
  }
}
Number.prototype.clamp = function (num1: number, num2: number, reverse?: boolean): number {
  if (this > num2) return reverse ? num1 : num2;
  if (this < num1) return reverse ? num2 : num1;
  return this;
}
