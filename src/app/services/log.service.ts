import { Injectable, NgZone } from '@angular/core';
import { LogData, LogColor, LAA } from '../data/log.data';
import { Category } from '../data/category';
import { Keyword } from '../data/keyword';
import { LogDate, NumberFromLogDate, evaluateLD, LogDateFromNumber } from '../data/log.date';
import { Action, ActionType } from '../data/action';
import { ActionSubject } from '../data/action.subject';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { IDAO } from '../db/i.db.handlers';
import { ipcRenderer } from 'electron';
import { debounceTime, distinctUntilChanged, switchMap, map, filter } from 'rxjs/operators';
import { threadId } from 'worker_threads';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private currentLogDate: BehaviorSubject<LogDate> = new BehaviorSubject<LogDate>(new LogDate(new Date(Date.now())));
  private dao: IDAO;
  private dbtime = 0;
  private monthLogs: BehaviorSubject<LogData[]> = new BehaviorSubject<LogData[]>([]);
  monthLogs$: Observable<LogData[]>;
  private matchedActoins: BehaviorSubject<Action[]> = new BehaviorSubject<Action[]>([]);
  private matchedActoinSubjects: BehaviorSubject<ActionSubject[]> = new BehaviorSubject<ActionSubject[]>([]);
  private openLogDialogFunc: (log: LogData) => any;
  private reloadLogs: boolean = true;
  currentLogDate$: Observable<LogDate> = this.currentLogDate.asObservable();
  toAdd: { log: LogData, action: Action, actsbj: ActionSubject, actionDetails: string };
  ctgs$: BehaviorSubject<Category[]>;

  constructor(
    private zone: NgZone
  ) {
    const n = NumberFromLogDate(this.currentLogDate.value);
    //console.log(`n:${n}`)
    ipcRenderer.send('get_logs', { from: n, till: n + 35 });
    this.currentLogDate.pipe(
      //debounceTime(300),
      //distinctUntilChanged(),
    ).subscribe(cd => {
      debounceTime(1000);
      const n = NumberFromLogDate({ ...this.currentLogDate.value, day: 1 });
      if (this.reloadLogs) ipcRenderer.send('get_logs', { from: n, till: n + 35 });
    });
    if (!this.ctgs$) this.ctgs$ = new BehaviorSubject(new Array<Category>());
    this.initElectronCom();

    this.monthLogs$ = this.monthLogs.asObservable();
  }
  private initElectronCom() {


    ipcRenderer.on('got_logs', (res, obs) => {
      this.zone.run(() => { this.monthLogs.next(obs); });
      //this.currentLogDate.next(this.currentLogDate.value);

    });
    this.createRecieveHook('got_actions_by_name', this.matchedActoins);
    this.createRecieveHook('got_action_subjects_by_name', this.matchedActoinSubjects);
    this.createRecieveHook('got_categories', this.ctgs$);
    ipcRenderer.send('get_categories');
    ipcRenderer.on('added_log_with_laa', (evt, res) => {
      this.toAdd.log.id = res;
      this.reloadLogs = true;
      this.zone.run(() => { this.currentLogDate.next(LogDateFromNumber(this.toAdd.log.start_date)); });
      console.log('added')
      console.log(this.toAdd)
      this.toAdd = null;
    });
    ipcRenderer.on('deleted_log', (evt, res) => {

      const n = NumberFromLogDate({ ...this.currentLogDate.value, day: 1 });
      ipcRenderer.send('get_logs', { from: n, till: n + 35 });
    });
    ipcRenderer.on('updated_log', (evt, res) => {
      const n = NumberFromLogDate({ ...this.currentLogDate.value, day: 1 });
      ipcRenderer.send('get_logs', { from: n, till: n + 35 });
    });

  }
  private createRecieveHook(hookName: string, behabs: BehaviorSubject<any>) {
    ipcRenderer.on(hookName, (evt, res) => { behabs.next(res) });
  }

  getDayLogs(date: LogDate): Observable<LogData[]> {
    return this.currentLogDate.pipe(
      switchMap(cld => {
        return this.monthLogs$.pipe(
          map(lds => lds.filter(((ld: LogData) => {
            //console.log("ForDay");
            //console.log(ld.start_date); console.log(NumberFromLogDate(this.currentLogDate.value));
            return ld.start_date === NumberFromLogDate(cld)
          })))
        )
      })
    );

  }
  getLog(logId: number) {
    ipcRenderer.send('get_log', logId);
  }
  getCategories(): Observable<Category[]> {
    ipcRenderer.send('get_categories');
    return this.ctgs$.asObservable();
  }
  getMonthLogs(date?: LogDate): Observable<LogData[]> {
    return this.monthLogs.asObservable();
  }

  getActs(logId: number) {
    ipcRenderer.send('get_acts', logId);
  }
  findActions(aname: string): Observable<Action[]> {
    this.matchedActoins.next([]);
    ipcRenderer.send('get_actions_by_name', aname);
    return this.matchedActoins.asObservable();
    return null;
  }
  findActionSubs(asname: string): Observable<ActionSubject[]> {
    this.matchedActoins.next([]);
    ipcRenderer.send('get_action_subjects_by_name', asname);
    return this.matchedActoinSubjects.asObservable();
  }
  getActionByName(aname: string): Action {
    return null;
  }
  getActionSubjectByName(aname: string): ActionSubject {
    return null;
  }

  changeDate(ld: LogDate) {

    var l = evaluateLD(ld);
    if (l.year === this.currentLogDate.value.year && l.month === this.currentLogDate.value.month) {
      this.reloadLogs = false;
    } else this.reloadLogs = true;
    this.currentLogDate.next(l);

  }
  changeDateWithoutNotify(ld: LogDate) {
    this.currentLogDate.value.day = ld.day;
    this.currentLogDate.value.year = ld.year;
    this.currentLogDate.value.month = ld.month;
  }
  getDate() {
    return this.currentLogDate.value;
  }
  tryAddLog() {
    console.log('destroying')
    ipcRenderer.send('add_log_with_laa', {
      log: this.toAdd.log,
      laa: {
        log_id: null,
        action_id: this.toAdd.action ? this.toAdd.action.id : null,
        action_subject_id: this.toAdd.actsbj ? this.toAdd.actsbj.id : null,
        details: this.toAdd.actionDetails ? this.toAdd.actionDetails:null
      }
    });
  }
  addCategory(name: string) {
    ipcRenderer.send('add_category', { id: null, name: name, color: LogColor.darkgreen, description:''});
  }
  addAction(action: Action) {
    ipcRenderer.send('add_action', action);
  }
  addActionSubject(actsb: ActionSubject) {
    ipcRenderer.send('add_action_subject', actsb);
  }
  updateLaa(laa: LAA) {
    ipcRenderer.send('update_laa', { data: { action_id: laa.action_id, action_subject_id: laa.action_subject_id, details: laa.details }, id: laa.log_id });
  }
  updateLog(log: LogData) {
    var data = {
      category_id: log.category_id,
      title: log.title,
      note: log.note,
      is_timed: log.is_timed,
      is_action: log.is_action,
      start_time: log.start_time,
      end_time: log.end_time,
      start_date: log.start_date,
      end_date: log.end_date,
      color: log.color
    }
    ipcRenderer.send('update_log', { data: data, id: log.id });
  }
  deleteLog(log: LogData) {
    ipcRenderer.send('delete_log', log.id);
  }
}





