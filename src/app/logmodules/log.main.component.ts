import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { LogDate } from '../data/log.date';
import { Router, ActivatedRoute, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { slideInAnimation } from './animations';
import { LogService } from '../services/log.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer, HammerGestureConfig } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { LogComponent } from './log/log.component';
import { takeWhile } from 'rxjs/operators';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-log.main',
  templateUrl: './log.main.component.html',
  styleUrls: ['./log.main.component.scss'],
  animations: [
    slideInAnimation,
    // animation triggers go here
  ]
})
export class LogMainComponent implements OnInit, OnDestroy {
  isMonth: boolean = true;
  private alive: boolean = true;
    private panstarted: boolean = false;
    private panning: boolean = false;
  private panended: boolean = false;
  private newDate: LogDate;
  constructor(
    private zone: NgZone,
    private matIconRegistry: MatIconRegistry,
    private ds:DomSanitizer,
    private logService:LogService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    logService.currentLogDate$.subscribe(
      ld => this.logDate = { ...ld}
    );
  }
  readonly maxDate: Date = new Date(Date.now());
  logDate: LogDate;
  ngOnInit(): void {
    this.isMonth = this.router.url.includes('month');
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.isMonth = this.router.url.includes('month');
      }
    // NavigationEnd
    // NavigationCancel
    // NavigationError
    // RoutesRecognized
    });
    //this.swipeAction();
    this.matIconRegistry.addSvgIcon(
      'add36',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/add-36.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'month36',
      this.ds.bypassSecurityTrustResourceUrl("./assets/icons/month-36.svg")
    );
    this.initEvents();
  }
  ngOnDestroy()
  {
    this.alive=false;
  }
  private initEvents() {
    ipcRenderer.on('got_log', (evt, res) => {
      this.zone.run(()=>this.dialog.open(LogComponent, { data: { log: res[0] }, panelClass: 'full-width-dialog' }));
    });
  }
  private swipeAction() {
    const hammerConfig = new HammerGestureConfig()
    const hammer=hammerConfig.buildHammer(document.documentElement)
    fromEvent(hammer, "swipe").pipe(
      takeWhile(()=>this.alive))
      .subscribe((res: any) => {
        if (res.deltaX != 0) {
          this.changeDate('month',-Math.sign(res.deltaX));
        }
    });
  }

  changeDate(type: string = '', amount: number = 0){
    switch (type) {
      case 'month': this.logDate.month += amount; break;
      case 'year': this.logDate.year += amount; break;
      default: this.logDate.day += amount; break;
    }
    var now = new Date(Date.now());
    if (now.getFullYear() === this.logDate.year && now.getMonth() + 1 < this.logDate.month) {
      this.logDate.month = now.getMonth() + 1;
    } else if (now.getFullYear() === this.logDate.year && now.getMonth() + 1 === this.logDate.month
    && now.getDate() < this.logDate.day) {
      this.logDate.day = now.getDate();
    }

    this.logService.changeDate(this.logDate);
  }

  addLog() {
    var diaref = this.dialog.open(LogComponent, {data:{ date:this.logDate}, panelClass: 'full-width-dialog'}, );
  }
  backTOMonthView() {
    this.logService.changeDateWithoutNotify({ ...this.logDate, day: 1 });
    this.router.navigate(['/logs/month']);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  dayMouseWheelEvent($event) {
    this.changeDate('',-Math.sign($event.deltaY));
  }
  panleft() {
    if (this.panning) {
      return;
    }
    if (this.newDate) return;
      this.panning = true;
      const d = { ...this.logDate };
      if (this.router.url.includes('month')) {
        var now = new Date(Date.now());
        if (now.getFullYear() > this.logDate.year || now.getMonth() + 1 > this.logDate.month) {
          d.month += 1;
        }
      }
    if (this.router.url.includes('day')) {
      var now = new Date(Date.now());
      if (now.getFullYear() > this.logDate.year
        || now.getMonth() + 1 > this.logDate.month || now.getDate() > this.logDate.day) {
        d.day += 1;
      }
    }

      this.newDate = d;
      if (!this.newDate) return;
      this.logService.changeDate(this.newDate);
      this.newDate = null;


  }
  panright() {
    if (this.panning) {
      return;
    }
    if (this.newDate) return;

      this.panning = true;
      const d = { ...this.logDate };
      if (this.router.url.includes('month')) {
        d.month -= 1;
      }
      if (this.router.url.includes('day')) {
        d.day -= 1;
      }
      this.newDate = d;

    if (!this.newDate) return;
    this.logService.changeDate(this.newDate);
    this.newDate = null;
  }
  panStarted() {
    this.panning = false;
  }
  // panEnded() {
  //   this.panning = false;
  //   this.panstarted = false;
  //   if (!this.newDate) return;
  //   this.logService.changeDate(this.newDate);
  //   this.newDate = null;
  // }
}
