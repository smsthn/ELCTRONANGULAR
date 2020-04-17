import { Component, OnInit, Input } from '@angular/core';
import { Action } from '../../data/action';
import {LogData} from '../../data/log.data';
import { Router, ActivatedRoute } from '@angular/router';
import { ChartsService } from '../charts.service';
import { LogService } from '../../services/log.service';
import { DateFromNumber } from '../../data/log.date';
import * as _moment from 'moment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detailed',
  templateUrl: './detailed.component.html',
  styleUrls: ['./detailed.component.scss']
})
export class DetailedComponent implements OnInit {
  action: Action = null;
  datas: DetailedData[] = [];
  progress: number[] = []
  display: string[] = []
  startDates: string[] = [];
  endDates: string[] = [];
  full: number = 0;
  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private chartService: ChartsService,
    private location:Location
  ) { }

  ngOnInit(): void {
    this.action = this.chartService.detailsAction;
    this.datas = this.chartService.detailedData;
    if (!this.action) {
      this.router.navigateByUrl('/charts/sum')
      return;
    }
    //console.log(this.chartService.detailedData)
    if (this.chartService.chartsType === 'Time') {
      let full = 0;
      const prog: number[] = []
      this.datas.forEach(d => {
        const cim = this.calculateInMinutes(d);
        prog.push(cim.asMinutes());
        full += cim.asMinutes();
        this.full = full;
        this.display.push(`Duration= ${cim.humanize(false)}`)
        const sd = _moment(DateFromNumber(d.start_date)).add((Math.floor(d.start_time / 100)*60)+d.start_time%100,'minutes')
        this.startDates.push(sd.format('DD.MM.YYYY  HH:mm'))
        const ed = _moment(DateFromNumber(d.end_date)).add((Math.floor(d.end_time / 100) * 60) + d.end_time % 100, 'minutes')
        this.endDates.push(ed.format('DD.MM.YYYY  HH:mm'))
      });
      this.progress = prog//prog.map(p => Math.floor(p / full * 100));
      //console.log(this.startDates)
    } else if (this.chartService.chartsType === 'Sum') {
      let full = 0;
      const prog: number[] = []
      this.datas.forEach(d => {
        const cim = d.data;
        prog.push(cim);
        full += cim;
        this.display.push(`${cim}`)
        this.display.push(`SUM=${cim}`)
        const sd = _moment(DateFromNumber(d.start_date)).add((Math.floor(d.start_time / 100) * 60) + d.start_time % 100, 'minutes')
        this.startDates.push(sd.format('DD.MM.YYYY  HH:mm'))
        const ed = _moment(DateFromNumber(d.end_date)).add((Math.floor(d.end_time / 100) * 60) + d.end_time % 100, 'minutes')
        this.endDates.push(ed.format('DD.MM.YYYY  HH:mm'))
      });
      this.progress = prog//prog.map(p => Math.floor(p / full * 100));
      this.full = full;
    }
  }
  private calculateInMinutes(rs) {
    let start = _moment(DateFromNumber(rs.start_date));
    let end = _moment(DateFromNumber(rs.end_date));
    start.add(Math.floor(rs.start_time / 100), 'hours');
    start.add(Math.floor(rs.start_time % 100), 'minutes');
    end.add(Math.floor(rs.end_time / 100), 'hours');
    end.add(Math.floor(rs.end_time % 100), 'minutes');
    const ds = _moment.duration(end.diff(start));
    return ds
  }
  getBack() {
    this.location.back()
  }

}
export interface DetailedData {
  id: number,
  title: string,
  note: string,
  start_date: number,
  start_time: number,
  end_date: number,
  end_time: number,
  color: string,
  is_timed: boolean,
  is_action: boolean,
  category_id: number,
  category_name: string,
  action_subject_name: string,
  details: string,
  data:number
}
