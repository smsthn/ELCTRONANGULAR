import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { LogDate } from './data/log.date';
import { slideInAnimation } from './logmodules/animations';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent implements OnInit {
  animationState = 'in';
  isExpanded: boolean = false;
  currentUrl: '/logs/month' | '/logs/day' | '/charts' | '/settings' = '/logs/month';
  //logDate:LogDate = {year:2020, month:1, day:15};
  constructor(
    private iconReg: MatIconRegistry,
    private ds: DomSanitizer,
    public electronService: ElectronService,
    private translate: TranslateService,
    private router: Router,
    private location: Location
  ) {
    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }
  ngOnInit(): void {
    const icn = ['menu18', 'month18', 'time18', 'note18', 'day18', 'chart18', 'settings18'];
    const icu = ['menu-18', 'month-18', 'time-18', 'note-18', 'day-18', 'chart-18', 'settings-18'];
    icn.forEach(
      (n, i) => this.iconReg.addSvgIcon(
        n,
        this.ds.bypassSecurityTrustResourceUrl(`./assets/icons/${icu[i]}.svg`),
      )
    );
    this.router.events.forEach(e => {
      if (e instanceof NavigationEnd) {
        if (e.urlAfterRedirects.includes('day')) this.currentUrl = '/logs/day';
        if (e.urlAfterRedirects.includes('month')) this.currentUrl = '/logs/month';
        if (e.urlAfterRedirects.includes('charts')) this.currentUrl = '/charts';
        if (e.urlAfterRedirects.includes('options')) this.currentUrl = '/settings';
      }
    }
    );
    if (this.location.path().includes('day')) this.currentUrl = '/logs/day';
    if (this.location.path().includes('month')) this.currentUrl = '/logs/month';
    if (this.location.path().includes('charts')) this.currentUrl = '/charts';
    if (this.location.path().includes('options')) this.currentUrl = '/settings';
  }
  toggleDrawer(drawer, time) {
    if (this.isExpanded) {
      drawer.toggle()
      setTimeout(() => { this.isExpanded = false }, time);
    } else {
      this.isExpanded = true;
      setTimeout(() => { drawer.toggle() }, time);
    }
  }
  goTo(url: '/logs/month' | '/logs/day' | '/charts' | '/settings') {
    if (this.currentUrl !== url) {
      this.currentUrl = url;
      this.router.navigateByUrl(url);
    }
  }


}
