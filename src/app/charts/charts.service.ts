import { Injectable, NgZone } from '@angular/core';
//import { ChartViewData, /*ChartDisplayType*/ } from './charts.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { Action, ActionType } from '../data/action';
import { Keyword } from '../data/keyword';
import { Category } from '../data/category';

import { NumberFromLogDate, LogDate, DateFromNumber } from '../data/log.date';
import { ipcRenderer } from 'electron';
import { LogColor } from '../data/log.data';
import * as NodeCache from 'node-cache';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import * as _moment from 'moment';

export interface IViewData {
  key: string, data: {
    id: number,
    action_id?: number,
    category_id?: number,
    name: string, sum: number
  }[]
}
export interface ISelectedAction {
  id: number, name: string, description?: string, type: ActionType,
  color?: LogColor, adverb?: string, category_ids: number[]
}
@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private gettingThings: boolean = false;
  private viewdatas: BehaviorSubject<IViewData[]> = new BehaviorSubject<IViewData[]>([]);
  additionalData: BehaviorSubject<IViewData[]> = new BehaviorSubject<IViewData[]>([]);
  private viewDatas$: Observable<IViewData[]>;//Data Displayed in Charts
  chartsType: 'Sum' | 'Time' = 'Time';
  chartsGetCommand: 'get_sum_data' | 'get_time_data' = 'get_time_data';
  private additionalDataTemp: IViewData[];//store while calculating
  selectedCategories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  selectedActions: BehaviorSubject<ISelectedAction[]> = new BehaviorSubject<ISelectedAction[]>([]);
  selectedKeywords: BehaviorSubject<Keyword[]> = new BehaviorSubject<Keyword[]>([]);

  detailsAction;
  detailedData;
  private str = [
    'one_action', 'many_actions', 'all_actions',
    'one_action_with_categories', 'many_actions_with_categories', 'all_actions_with_categories',
    'one_actionwith_keywords', 'many_actionswith_keywords', 'all_actionswith_keywords',
    'one_actionwith_categories_keywords', 'many_actionswith_categories_keywords', 'all_actionswith_categories_keywords',];
  _cache: NodeCache;//store matching actions/ctgs/keywords her

  currentSelection: 'allActions' | 'allCategories' | 'allKeywords' = 'allActions';//currently selected tab
  filteringData: BehaviorSubject<Action[] | Category[] | Keyword[]>
    = new BehaviorSubject<Action[] | Category[] | Keyword[]>([]);
  filterWords: BehaviorSubject<string> = new BehaviorSubject<string>('');



  //displayType: BehaviorSubject<ChartDisplayType>;
  //viewdata: BehaviorSubject<ChartViewData>;
  duration: BehaviorSubject<Duration>;//TODO: REMEMBER MONTH + 1
  //chartType: ChartType = ChartType.Sum;//TODO:make it behaviour and charts mainview change view when this changes
  private chartData: BehaviorSubject<ChartData>;


  constructor(
    private zone: NgZone
  ) {
    const options: NodeCache.Options = { useClones: true };
    this._cache = new NodeCache(options);
    this.filterWords.asObservable().pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(s => {
      this.filteringData.next((this._cache.get(this.currentSelection) as Action[] | Category[] | Keyword[])
        //.filter(d => !s || d.name.toLocaleLowerCase().includes(s))
      );
    });
    this.getACK();
    //this.displayType = new BehaviorSubject<ChartDisplayType>(ChartDisplayType.Action);
    //this.viewdata = new BehaviorSubject<ChartViewData>({});
    const fr = _moment().startOf('week').toDate();
    const tl = _moment().toDate()
    this.duration = new BehaviorSubject<Duration>({ from: fr, till: tl });
    let data = { from: NumberFromLogDate(new LogDate(fr)), till: NumberFromLogDate(new LogDate(tl)), type: this.chartsType };
    ipcRenderer.send('get_actions', data);
    ipcRenderer.send('get_categories', data);
    ipcRenderer.send('get_keywords', data);
    this.chartData = new BehaviorSubject<ChartData>(
      {
        from: NumberFromLogDate(new LogDate(fr)),
        till: NumberFromLogDate(new LogDate(tl)),

      });
    this.viewDatas$ = this.viewdatas.asObservable();

    this.chartData.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(
      cd => {
        if (!this.gettingThings) {
          ipcRenderer.send(this.chartsGetCommand, cd);
          this.gettingThings = true;
        }
      }
    )

    this.duration.subscribe(
      d => {
        let f = _moment(d.from).toDate();
        let t = _moment(d.till).toDate();

        let data = { from: NumberFromLogDate(new LogDate(f)), till: NumberFromLogDate(new LogDate(t)), type: this.chartsType };
        ipcRenderer.send('get_actions', data);
        ipcRenderer.send('get_categories', data);
        ipcRenderer.send('get_keywords', data);

        const newFrom = NumberFromLogDate(new LogDate(f));
        const newTill = NumberFromLogDate(new LogDate(t));
        this.chartData.next({ ...this.chartData.value, from: newFrom, till: newTill })
      }
    );
    this.initGotDataEvents();
  }
  private getACK() {
    if (this.duration) {
      const data = {
        from: NumberFromLogDate(new LogDate(this.duration.value.from)),
        till: NumberFromLogDate(new LogDate(this.duration.value.till)),
        type: this.chartsType
      }
      ipcRenderer.send('get_actions', data);
      ipcRenderer.send('get_categories', data);
      ipcRenderer.send('get_keywords', data);
    }



    ipcRenderer.on('got_actions', (evt, result) => {
      const res: ISelectedAction[] = [];
      let id = -1;
      result.forEach(r => {
        if (r.id === id) {
          res[res.length - 1].category_ids.push(r.category_id)
        } else {
          id = r.id;
          res.push(
            {
              id: r.id, name: r.name, description: r.description, type: r.type,
              color: r.color, adverb: r.adverb, category_ids: [r.category_id]
            }
          )
        }
      });
      if (this.currentSelection === 'allActions') this.zone.run(() => { this.filteringData.next(res); });
      this._cache.set('allActions', res);
    });
    ipcRenderer.on('got_categories', (evt, res) => {
      if (this.currentSelection === 'allCategories') this.zone.run(() => { this.filteringData.next(res); });
      this._cache.set('allCategories', res);
    });
    ipcRenderer.on('got_keywords', (evt, res) => {
      if (this.currentSelection === 'allKeywords') this.zone.run(() => { this.filteringData.next(res); });
      this._cache.set('allKeywords', res);
    });
  }
  private getData() {
    const d = { ...this.chartData.value };
    this.chartData.value.action = null;
    this.chartData.value.actions = null;
    this.chartData.value.categories = null;
    this.chartData.value.Keywords = null;
    this.chartData.next(d);
  }
  private initGotDataEvents() {
    this.str.forEach(s => {
      ipcRenderer.on(s, (evt, result) => {
        this.gettingThings = false;
        let res = result.type === 'get_sum_data' ? result.res
          : this.calculateTimeSums(result.res);
        res = res.sort((a1, a2) => a2.sum - a1.sum)
        if (s.includes('with_categories')) {
          this.viewdatas.next(
            (res && res.length > 1) ? [{ key: 'categorties', data: res }] : []
          )
        } else {
          this.viewdatas.next([
            { key: s.includes('keywords') ? 'keywords' : 'actions', data: res }
          ])
        }
      })
    });
    ipcRenderer.on('got_category_actions', (evt, result) => {
      this.gettingThings = false;
      let res = result.type === 'get_sum_data' ? result.res
        : { key: result.res.key, data: this.calculateTimeSums(result.res.data) };
      res = res//.sort((a1, a2) => a2.sum - a1.sum)
      this.viewdatas.next([...this.viewdatas.value, res])
    })
  }
  private calculateTimeSums(res) {
    const result: { id: number, action_id?: number, category_id?: number, name: string, sum: number }[] = [];
    this.additionalDataTemp = [];
    let id = -1;
    for (let rs of res) {
      const sm = this.calculateInMinutes(rs);
      if (rs.id === id) {
        result[result.length - 1].sum += sm;
        if (this.chartsGetCommand !== 'get_sum_data') {
          this.additionalDataTemp[this.additionalDataTemp.length - 1].data.push({ id: rs.start_date, name: `${result[result.length - 1].sum}`, sum: sm });
          this.additionalDataTemp[this.additionalDataTemp.length - 1].data[0].name = `${result[result.length - 1].sum}`;
        }
      } else {
        id = rs.id;
        result.push({ id: rs.id, action_id: rs.action_id, category_id: rs.category_id, name: rs.name, sum: sm });
        if (this.chartsGetCommand !== 'get_sum_data') {
          if (this.additionalDataTemp.length === 4) {
            this.additionalDataTemp = this.additionalDataTemp.sort((ad1, ad2) =>
              result.find(r => r.id === +ad2.key).sum - result.find(r => r.id === +ad1.key).sum);
            this.additionalDataTemp[this.additionalDataTemp.length - 1] =
              ({ key: rs.id, data: [{ id: rs.start_date, name: `${sm}`, sum: sm }] })
          } else {
            this.additionalDataTemp.push({ key: rs.id, data: [{ id: rs.start_date, name: `${sm}`, sum: sm }] })
          }
        }
      }
    }
    if (this.additionalDataTemp.length > 0) {
      this.additionalDataTemp = this.additionalDataTemp.sort((ad1, ad2) =>
        result.find(r => r.id === +ad2.key).sum - result.find(r => r.id === +ad1.key).sum)
      this.additionalDataTemp.forEach(s => {
        while (s.data.length > 10) {
          s.data = s.data.filter((d, i) => i % 2 === 0);
        }
      })
    }
    //this.additionalData.next([]);
    this.additionalData.next(this.additionalDataTemp.slice(0, 3));
    this.additionalDataTemp = [];
    return result;
  }
  private calculateInMinutes(rs): number {
    let start = _moment(DateFromNumber(rs.start_date));
    let end = _moment(DateFromNumber(rs.end_date));
    start.add(Math.floor(rs.start_time / 100), 'hours');
    start.add(Math.floor(rs.start_time % 100), 'minutes');
    end.add(Math.floor(rs.end_time / 100), 'hours');
    end.add(Math.floor(rs.end_time % 100), 'minutes');
    return _moment.duration(end.diff(start)).asMinutes();
  }
  getViewDatas() {
    return this.viewDatas$;
  }
  changeDate(from: MsDate | Date, till: MsDate | Date) {
    var fr: Date;
    var tl: Date;
    if (from instanceof MsDate && till instanceof MsDate) {
      fr = new Date(from.year, from.month - 1, from.day);
      tl = new Date(till.year, till.month - 1, till.day);
    } else {
      fr = from as Date;
      tl = till as Date;
    }
    this.duration.next({ from: fr, till: tl });
  }

  getAllData() {
    return this.filteringData.asObservable();
  }

  getAllActions() {
    this.currentSelection = 'allActions';
    return this.filteringData.next((this._cache.get('allActions') as ISelectedAction[])
      .filter((a) => !this.selectedActions.value.find(sa => sa.id === a.id)
        && (!this.selectedCategories.value || this.selectedCategories.value.length === 0 ||
          this.selectedCategories.value.some(c => a.category_ids.includes(c.id)))
        && (!this.filterWords.value || a.name.toLocaleLowerCase()
          .includes(this.filterWords.value.toLocaleLowerCase()))));
  }

  getAllCategories() {
    this.currentSelection = 'allCategories';
    return this.filteringData.next((this._cache.get('allCategories') as Category[])
      .filter((c: Category) => !this.selectedCategories.value.find(sa => sa.id === c.id)
        && (!this.selectedActions.value || this.selectedActions.value.length === 0 ||
          this.selectedActions.value.some(a => a.category_ids.includes(c.id)))
        && (!this.filterWords.value || c.name.toLocaleLowerCase()
          .includes(this.filterWords.value.toLocaleLowerCase()))));
  }

  getAllKeywords() {
    this.currentSelection = 'allKeywords';
    return this.filteringData.next((this._cache.get('allKeywords') as Keyword[])
      .filter((a: Keyword) => !this.selectedKeywords.value.find(sa => sa.id === a.id)
        //TODO: FILTER HERE AS WELL TODO: \\
        && (!this.filterWords.value || a.name.toLocaleLowerCase()
          .includes(this.filterWords.value.toLocaleLowerCase()))));
  }
  filterData(str: string) {
    this.filterWords.next(str);
  }
  selectItem(item) {
    this.filteringData.next(this.filteringData.value.filter(d => d !== item));
    switch (this.currentSelection) {
      case 'allActions': if (this.chartData.value.action) {
        if (this.chartData.value.actions) this.chartData.value.actions.push(item);
        else this.chartData.value.actions = [item]
      }
      else this.chartData.value.action = item;
        break;
      case 'allCategories':
        if (this.chartData.value.categories) this.chartData.value.categories.push(item);
        else this.chartData.value.categories = [item];
        break;
      default:
        if (this.chartData.value.Keywords) this.chartData.value.Keywords.push(item);
        else this.chartData.value.Keywords = [item];
        break;
    }
    this.getData();
  }
  unselectItem(item, type: string) {
    if (type === 'action' && this.currentSelection === 'allActions' ||
      type === 'category' && this.currentSelection === 'allCategories' ||
      type === 'keyword' && this.currentSelection === 'allKeywords'
    ) {
      this.filteringData.value.push(item);
      this.filteringData.value.sort((a1, a2) => a1.id - a2.id)
    }
    switch (type) {
      case 'action': this.chartData.value.action
        = this.chartData.value.actions ? this.chartData.value.actions[0] : null;
        if (this.chartData.value.actions) this.chartData.value.actions
          = this.chartData.value.actions.filter(a => a.id !== item.id);
        else this.chartData.value.actions = null;
        if (this.chartData.value.actions && this.chartData.value.actions.length === 1)
          this.chartData.value.actions = null;
        break;
      case 'category':

        if (this.chartData.value.categories) this.chartData.value.categories
          = this.chartData.value.categories.filter(a => a.id !== item.id);
        else this.chartData.value.categories = null;
        if (this.chartData.value.categories && this.chartData.value.categories.length === 0)
          this.chartData.value.categories = null;
        break;
      default:
        if (this.chartData.value.Keywords !== null) this.chartData.value.Keywords
          = this.chartData.value.Keywords.filter(a => a.id !== item.id);
        else this.chartData.value.Keywords = null;
        if (this.chartData.value.Keywords && this.chartData.value.Keywords.length === 0)
          this.chartData.value.Keywords = null;
        break;
    }
    this.getData();
  }
  unselectAll(type: string) {
    if (type === 'action' && this.currentSelection === 'allActions') {
      this.getAllActions();
    }
    if (type === 'category' && this.currentSelection === 'allCategories') {
      this.getAllCategories();
    }
    if (type === 'keyword' && this.currentSelection === 'allKeywords') {
      this.getAllKeywords();
    }
    switch (type) {
      case 'action': this.chartData.value.action = null; this.chartData.value.actions = null; break;
      case 'category': this.chartData.value.categories = null; break;
      default: this.chartData.value.Keywords = null; break;
    }
    this.getData()
  }

  getForAction(action) {
    this.detailsAction = action;
    this.detailedData = null;
    ipcRenderer.send('get_log_and_laa_subj_for_action', {
      from: this.chartData.value.from,
      till: this.chartData.value.till,
      action_id: action.id
    });

  }

  getCategories() {

  }
  changeViewType(type: 'Sum' | 'Time' | 'Count' | 'Detailed') {
    switch (type) {
      case 'Time': this.chartsType = "Time";  this.chartsGetCommand = 'get_time_data'; break;
      case 'Sum': this.chartsType = "Sum"; this.chartsGetCommand = 'get_sum_data'; break;
    }
    this.selectedActions.next([]);
    this.selectedCategories.next([]);
    this.selectedKeywords.next([]);
    this.chartData.next({ from: this.chartData.value.from, till: this.chartData.value.till });
    this.getACK();
    this.getData();
  }
}

export type Duration = { from: Date, till: Date }

export class MsDate {
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  day: number = new Date().getDate();
}
export interface ChartDisplayData {
  key: Action | Keyword | Category | ActionWithKeyword | ActionWithCategory | ActionWithKeywordAndCategory,
  value: number
}
export type ActionWithKeyword = {
  action: Action, keyword: Keyword
}
export type ActionWithCategory = {
  action: Action, category: Category
}
export type ActionWithKeywordAndCategory = {
  action: Action, keyword: Keyword, category: Category
}
export enum ChartType {
  Sum = 'Sum', Count = 'Count'
}
export type ChartData = {
  action?: Action, from: number, till: number,
  actions?: Action[], categories?: Category[], Keywords?: Keyword[],
}

