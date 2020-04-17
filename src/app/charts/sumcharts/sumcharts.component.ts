import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, NgZone, ChangeDetectorRef, OnDestroy, Inject } from '@angular/core';
import Chart from 'chart.js';
//import { ChartDisplayType, ChartViewData } from '../charts.component';
import { Action } from '../../data/action';
import { Keyword } from '../../data/keyword';
import { Category } from '../../data/category';
import { ChartsService } from '../charts.service';
import { ipcRenderer } from 'electron';
import { keyframes, trigger, transition, animate, style } from '@angular/animations';
import { visitAll } from '@angular/compiler';
import { Subscription } from 'rxjs';
import { LogService } from '../../services/log.service';
import { DOCUMENT } from '@angular/common';





@Component({
  selector: 'app-sumcharts',
  templateUrl: './sumcharts.component.html',
  styleUrls: ['./sumcharts.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0 }),
            animate('200ms ease-out',
              style({ height: 50 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 50 }),
            animate('200ms ease-in',
              style({ height: 0 }))
          ]
        )
      ]
    )
  ]
})
export class SumchartsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('myCharts') myCharts: ElementRef;
  @ViewChild('AdditionalCanvas') AdditionalCanvas: ElementRef;
  viewdatas: { key: string, data: { id: number, name: string, sum: number }[] }[] = [];
  subsciption: Subscription;
  viewAdditional: boolean = false;
  additionalLength: number = 0;
  constructor(
    @Inject(DOCUMENT) document,
    private zone: NgZone,
    private cref: ChangeDetectorRef,
    private chartService: ChartsService
  ) { }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.subsciption.unsubscribe();

  }
  ngAfterViewInit(): void {
    this.subsciption = this.chartService.getViewDatas().subscribe(
      ds => {
        if (this.chartService.chartsGetCommand === 'get_sum_data') {
          setTimeout(() => {
            this.additionalLength = 0;
            this.viewAdditional = false;
          }, 300)
        }
        //console.log('ds')
        //console.log(ds)
        if (!ds || ds.length === 0 || !ds[0].data || ds[0].data.length === 0) {
          this.zone.run(() => {
            this.viewdatas = null;
            this.cref.detectChanges();
          })
          return;
        } else {
          //console.log('gotty')
          this.zone.run(() => {
            this.viewdatas = ds;
            this.cref.detectChanges();
            this.viewdatas.forEach((d, i) => {
              this.initChart(d.data.slice(0, 20), d.key, i);
            });
          }
          )
        }
      }
    );
    this.chartService.additionalData.asObservable().subscribe(
      ad => {
        if (!ad || ad.length === 0) {
          this.zone.run(() => {
            setTimeout(() => {
              this.viewAdditional = false;
              this.cref.detectChanges();
            }, 300)

          })
          return;
        } else {
          this.zone.run(() => {
            setTimeout(() => {
              this.viewAdditional = true;
              this.cref.detectChanges();
              this.initAdditionalChart(ad)
            }, 300)

          })

        }
      }
    );
  }
  initChart(data, key, ind,trys:number = 0) {
    if (!data || data.length === 0) return;
    if (!(<HTMLCanvasElement>document.getElementById(`${key}${ind}`))) {
      if (trys < 5)
        setTimeout(() => { this.initChart(data,key,ind, trys++) }, 300);
      return;
    }
    const clrs = data.map(d => `rgba(${this.rand255()},${this.rand255()},${this.rand255()}, 1)`);
    let myChartCtx = (<HTMLCanvasElement>document.getElementById(`${key}${ind}`)).getContext('2d');
    var chart = new Chart(myChartCtx, {
      type: 'pie',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: '# of Votes',
          data: data.map(d => d.sum),
          backgroundColor: clrs,
          borderColor: clrs,
          borderWidth: 1
        }]
      },
      options: {
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        onClick: (a, e) => { this.chartService.getForAction(data[+e[0]['_index']]) }
      }
    });
  }
  private initAdditionalChart(data, trys: number = 0) {
    this.additionalLength = data.length;
    if (!this.viewAdditional || !data ||
      data.length === 0 || data[0].data.length === 0
      || !this.viewdatas || this.viewdatas.length === 0 || !this.viewdatas[0].data || this.viewdatas[0].data.length === 0
    ) return;
    if (!this.AdditionalCanvas) {
      if (trys < 5)
        setTimeout(() => { this.initAdditionalChart(data, trys++) }, 300);
      return;
    }
    var lables = data.map(d => d.data).flat().map(d => d.id)
      .filter((v, i, a) => a.indexOf(v) === i).sort((a1, a2) => a1 - a2);
    let myChartCtx = this.AdditionalCanvas.nativeElement.getContext('2d');

    var chart = new Chart(myChartCtx, {
      type: 'line',
      data: {
        labels: lables,
        datasets: data.sort((d1, d2) => d1.data[0].id - d2.data[0].id).map((d, ii) => {
          const clr = `rgba(${this.rand255()},${this.rand255()},${this.rand255()}, 1)`;
          return {
            label: d.key,
            data: d.data
              .map(
                s => { return { x: s.id, y: s.sum } }
              ),
            borderColor: clr,
            fill: false
          }
        })
      },
      options: {
        spanGaps: true,
        scales: {
          yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true
            }
          }]
        },
        //onClick: (a, e) => { this.chartService.getForAction(data[+e[0]['_index']]) }
      }
    });
  }
  private rand255() {
    return Math.floor(Math.random() * 190) + 60;
  }
}




