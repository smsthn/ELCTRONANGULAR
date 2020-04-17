import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { LogData, LogColor } from '../../data/log.data';
import { LogService } from '../../services/log.service';
import { MatDialog } from '@angular/material/dialog';
import { LogComponent } from '../log/log.component';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NumberFromLogDate, LogDate } from '../../data/log.date';
import { switchMap, debounceTime, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { slider } from '../animations';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import * as _moment from 'moment';


@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerGestureConfig
    }],
  animations: [
    slider,
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('500ms ease-out',
              style({ height: 300, opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 500, opacity: 1 }),
            animate('600ms ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ],
})
export class MonthComponent implements OnInit {
  readonly monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  readonly years: number[] = Array(1000).fill(2020).map((v, i) => v - i);
  //TODO: MAKE CURRENT YEAR TODO:\\
  private screenHeight: number;
  private screenWidth: number;
  prevLeft: number = -200;
  daysinmonth: number;
  diffStartOfWeek: number = 0;
  monthLogs$: Observable<LogData[]>;
  monthDayLogs: Array<LogArr> = [];
  readonly weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private dateTimeout;
  logColors = [LogColor.red, LogColor.yellow, LogColor.lightblue, LogColor.blue, LogColor.purple, LogColor.pink,
  LogColor.white, LogColor.bluegray, LogColor.orange, LogColor.green, LogColor.darkgreen,];
  colors = ["#FB234A", "#D9CC46", "#5DA4C5", "#0048FF", "#A833FF", "#FF0079", "#fafafa", "#5F7D8A",
    "#D15950", "#008D7B", "#008600",];
  constructor(
    private zone: NgZone,
    private cref: ChangeDetectorRef,
    private logService: LogService,
    public dialog: MatDialog,
    private ds: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private route: ActivatedRoute,
    private router: Router) { this.getScreenSize(); }
  date: BehaviorSubject<MDate>;
  maxDate: Date = new Date(Date.now());
  currentMonth: boolean = false;


  ngOnInit(): void {
    this.matIconRegistry.addSvgIcon(
      'note18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/note-18.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'action18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/action-18.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'time18',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/time-18.svg")
    );
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
      }
    });
    this.logService.currentLogDate$.subscribe(
      ld => {
        const d: MDate = { year: ld.year, month: ld.month };
        this.currentMonth = d.year === this.maxDate.getFullYear() && d.month === this.maxDate.getMonth() + 1;
        if (this.date) {
          return this.date.next(d);
        } else {
          return this.date = new BehaviorSubject<MDate>(d);
        }
      }
    );
    this.monthLogs$ = this.logService.getMonthLogs();
    this.monthLogs$.subscribe((s) => {
      var d = this.date.value;
      this.daysinmonth = new Date(d.year, (d.month), 0).getDate();
      const arr: Array<LogArr> = Array<LogArr>(this.daysinmonth).fill(null).map(() => []);
      s.forEach(l => {
        const i = (l.start_date % 100) - 1;
        if ((l.start_date % 100) <= this.daysinmonth)
          if (arr[i].length < 3) {
            arr[i].push(l);
          } else {
            if (arr[i].length === 3) {
              arr[i].push(new LogData(-1, 1))
            } else { arr[i][3].category_id++; }//this is only used to display how many more logs there are
          }
      })
      const dt = this.logService ? this.logService.getDate() : new LogDate(new Date());
      const beginning = _moment(new Date(dt.year, dt.month - 1, 1));
      const firstDayOfWeek = _moment(beginning).startOf('week');
      this.diffStartOfWeek = Math.floor(_moment.duration(beginning.diff(firstDayOfWeek)).asDays() + 1);
      if (this.diffStartOfWeek === 7)
        this.diffStartOfWeek = 0;
      for (let i = 0; i < this.diffStartOfWeek; i++) {
        arr.unshift([]);
      }


      while (arr.length < 35) {
        arr.push([])
      }
      this.zone.run(() => this.monthDayLogs = arr);
    });
  }
  openDialog($event, logId: number) {
    event.stopPropagation();
    this.logService.getLog(logId);
  }
  goToDay(day: number) {
    const now = _moment();
    const d = day - this.diffStartOfWeek + 1;
    const md = this.date.value;
    if (this.isNow()) {
      if (d > now.date()) return;
    }
    if (d < 1) {
      md.month--; this.clampDate(); return this.logService.changeDate({ ...md, day: 1 });
    }
    if (d > this.daysinmonth) {
      md.month++; this.clampDate(); return this.logService.changeDate({ ...md, day: 1 });
    }

    this.logService.changeDate({ ...this.date.value, day: d });
    this.router.navigate(['/logs/day']);
  }

  onpan(event) {
    this.goToDay(1);
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
      this.clampDate();
      this.logService.changeDate({ ...this.date.value, day: 1 });
    }, time)
  }
  mouseWheelEvent(event, type: 'year' | 'month') {
    type === 'year' ? (this.date.value.year -= Math.sign(event.deltaY)) : ((this.date.value.month -= Math.sign(event.deltaY)));
    this.clampDate()
    return this.changeDateTimeout(100);
  }
  private isNow(): boolean {
    const now = _moment();
    const md = this.date.value;
    return md.year === now.year() && md.month === now.month() + 1;
  }
  private isLater(): boolean {
    const now = _moment();
    const md = this.date.value;
    return md.year > now.year() || (md.year === now.year() && md.month > now.month() + 1);
  }
  private clampDate(change: boolean = true) {
    const now = _moment();
    const md = this.date.value;
    const nl = this.isNow() || this.isLater();
    console.log(nl)
    const newm = md.month.clamp(1, nl ? now.month() + 1 : 12, change && !nl);
    if (change) md.year += Math.sign(md.month - newm);
    md.month = newm;
    md.year = md.year.clamp(1900, now.year());
  }
  drop(event) {
    this.prevLeft += event.distance.x;
    if (Math.abs(event.distance.x) >= Math.min(this.screenWidth / 4, 1200 / 4)) {
      console.log('sdadas')
      this.date.value.month -= Math.sign(event.distance.x);
      this.changeDateTimeout(0);
    }
  }


  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    //console.log(this.screenHeight, this.screenWidth);
  }
}
interface MDate {
  year: number;
  month: number;
}
function StringToMDate(str: String): MDate {
  var y = +str.substring(0, 4);
  var m = +str.substring(4, 6);
  return { year: y, month: m };
}
function DateToMDate(d: Date): MDate {
  return { year: d.getFullYear(), month: d.getMonth() };
}

type LogArr = LogData[];

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
