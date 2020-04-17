import { Component, OnInit, Input, Output, EventEmitter, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LAA, LogColor } from '../../data/log.data';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { ActionSubject } from '../../data/action.subject';
import { ActionType, Action } from '../../data/action';
import { debounceTime, distinctUntilChanged, switchMap, delay } from 'rxjs/operators';
import { LogService } from '../../services/log.service';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit, OnDestroy {
  action: Action;
  actionTypes: ActionType[] = Object.values<ActionType>(ActionType);
  actionType: string = '';
  actionName: BehaviorSubject<string>;
  actionFound: boolean = false;
  actionFocus: boolean = false;
  actionmatch: Action[];
  creatingAction: boolean = false;
  actionSubject: ActionSubject;
  actionSubjectName: BehaviorSubject<string>;
  actionSubjectFound: boolean = false;
  actionSubjectFocus: boolean = false;
  actionSubjectmatch: ActionSubject[];
  creatingActionSubject: boolean = false;
  laa: LAA;
  finishedInit: boolean = false;
  @Input() logId: number;
  @Input() isEdit: boolean = false;
  @Output() logTitle = new EventEmitter<string>();
  constructor(
    private zone: NgZone,
    //private cref: ChangeDetectorRef,
    private logService: LogService,
  ) { }


  ngOnInit(): void {
    if (this.isEdit) {
      //console.log('edit')
      this.logService.getActs(this.logId);
      ipcRenderer.on('got_acts', (evt, res) => {
        //console.log('got_result')
        this.zone.run(
          () => {
            const acts = res;
            this.laa = acts.laa;
            this.action = acts.action;
            this.actionSubject = acts.actsbj;
            this.actionFound = !!this.action;
            //console.log(this.action)
            //console.log(this.actionSubject)
            this.actionFocus = false;
            this.actionSubjectFound = !!this.actionSubject;
            this.actionSubjectFocus = false;

            this.actionName = new BehaviorSubject<string>(this.action ? this.action.name : '');
            // else
            //   if (acts.action) this.actionName.next(this.action.name);

            this.actionSubjectName = new BehaviorSubject<string>(this.actionSubject ? this.actionSubject.name : '');
            // else
            //   if (acts.actsbj) this.actionSubjectName.next(this.actionSubject.name);

            this.initObs();
            this.actionFound = !!this.action;
            this.actionFocus = false;
            this.actionSubjectFound = !!this.actionSubject;
            this.actionSubjectFocus = false;
            this.finishedInit = true;
          }
        )
      });
    } else {
      //console.log('notedit')
      this.laa = { log_id: this.logId };
      this.actionName = new BehaviorSubject<string>(this.action ? this.action.name : '');
      this.actionSubjectName = new BehaviorSubject<string>(this.actionSubject ? this.actionSubject.name : '');
      this.initObs();
      this.finishedInit = true;
      //this.logService.toAdd = { log: null, action: null, actsbj: null, actionDetails: null };//TODO:remove
    }
  }
  ngOnDestroy(): void {

    if (this.actionName.value && this.actionSubjectName.value) {
      this.changeLogTitle();
      if (this.isEdit) {
        this.logService.updateLaa(this.laa);
      } else {
        this.logService.toAdd.action = this.action;
        this.logService.toAdd.actsbj = this.actionSubject;
        this.logService.toAdd.actionDetails = this.laa.details;
      }
    } else {
      //console.log('todelete');
      this.logTitle.emit('');
    }
  }
  private initObs() {
    ipcRenderer.on('added_action', (evt, res) => {
      ipcRenderer.send('get_action', res[0])
    });
    ipcRenderer.on('got_action', (evt, res) => {
      if (this.action && this.action.name === this.actionName.value && this.action.name === res[0].name) {
        this.action.id = res[0].id;
      }
      //this.action = res[0];
    });
    ipcRenderer.on('added_action_subject', (evt, res) => {
      ipcRenderer.send('get_action_subject', res[0])
    });
    ipcRenderer.on('got_action_subject', (evt, res) => {
      if (this.actionSubject &&
        this.actionSubject.name === this.actionSubjectName.value &&
        this.actionSubject.name === res[0].name) {
        this.actionSubject.id = res[0].id;
      }
      //this.action = res[0];
    });
    ipcRenderer.on('matched_actions', (evt, res) => {
      this.zone.run(() => {
        var rs = res as Action[];
        this.action = res.find(a => a.name === this.actionName.value);
        this.actionFound = !!this.action;
        if (this.actionFound) this.actionmatch = rs.filter(a => a.id != this.action.id);
        else this.actionmatch = rs;
        if (this.creatingAction && !this.action) this.action = { id: null, name: this.actionName.value, type: ActionType.None }
      })
    });
    this.actionName.asObservable().subscribe(
      an => {
        if (!an || (this.action && this.action.name === an)) {
          this.actionmatch = [];
          this.creatingAction = false;
          this.actionFound = !!an && this.action.name === an;
          return;
        } else {
          ipcRenderer.send('match_actions', an);
        }
      }
    );
    ipcRenderer.on('matched_action_subjects', (evt, res) => {
      this.zone.run(() => {
        var rs = res as ActionSubject[];
        this.actionSubject = res.find(a => a.name === this.actionSubjectName.value);
        this.actionSubjectFound = !!this.actionSubject;
        if (this.actionSubjectFound) this.actionSubjectmatch = rs.filter(a => a.id != this.actionSubject.id);
        else this.actionSubjectmatch = rs;
      })
    });
    this.actionSubjectName.asObservable().subscribe(
      an => {
        if (!an || (this.actionSubject && this.actionSubject.name === an)) {
          this.actionSubjectmatch = [];
          this.creatingActionSubject = false;
          this.actionSubjectFound = !!an && this.actionSubject.name === an;
          return;
        } else {
          ipcRenderer.send('match_action_subjects', an);
        }
      }
    );
  }
  actionLostFocus() {

    if (this.creatingAction || !this.action || (
      this.action.name.toLocaleLowerCase() !== this.actionName.value.toLocaleLowerCase() && !this.actionType)) return;
    this.actionFocus = false;
  }
  actionSubjectLostFocus() {
    if (this.creatingActionSubject || !this.actionSubject ||
      this.actionSubject.name.toLocaleLowerCase() !== this.actionSubjectName.value.toLocaleLowerCase()) return;
    this.actionSubjectFocus = false;
  }
  actionClicked(action: Action) {

    //if(this.action)this.log.title.replace(this.action.name, name);//TODO: fix
    this.action = action;
    this.laa.action_id = this.action.id;
    this.actionName.next(action.name); this.creatingAction = false;
    if (!this.isEdit) this.logService.toAdd.action = this.action;
    this.actionFound = true;
  }
  actionSubjectClicked(actionsubject: ActionSubject) {
    //if(this.actionSubject)this.log.title.replace(this.actionSubject.name, name);//TODO: fix
    this.actionSubject = actionsubject;
    this.laa.action_subject_id = this.actionSubject.id;
    this.actionSubjectName.next(actionsubject.name); this.creatingActionSubject = false;
    if (!this.isEdit) this.logService.toAdd.actsbj = this.actionSubject;
    this.actionSubjectFound = true;
    //TODO: if(action && actionsubject && !isEdit)this.logService.addActs();
  }
  addAction() {
    if (!this.actionName.value) return;
    if (this.creatingAction && !this.actionFound && (!this.actionType || !this.action.adverb)) return;
    if (!this.action && !this.actionType && !this.actionFound) {

      this.creatingAction = true;
      this.action = {
        id: null, name: this.actionName.value,
        description: '', color: LogColor.pink,
        adverb: null, type: ActionType[this.actionType]
      };
      return;
    }
    if (this.actionName.value && !this.actionFound && this.actionType && this.action && this.action.adverb) {

      this.action.type = ActionType[this.actionType];
      this.logService.addAction(this.action);
      this.actionFound = true;
      this.laa.action_id = this.action.id;//TODO:get id from db
      if (!this.isEdit) this.logService.toAdd.action = this.action;
      this.creatingAction = false;
      this.actionType = null;
      this.changeLogTitle();
    }
    if (this.actionFound) {

      this.creatingAction = false;
      this.laa.action_id = this.action.id;
      if (!this.isEdit) this.logService.toAdd.action = this.action;
      this.actionType = null;
      this.changeLogTitle();
    }

  }
  addActionSubject() {
    if (!this.actionSubject && !this.actionSubjectFound && this.actionSubjectName.value) {

      this.actionSubject = {
        id: null, name: this.actionSubjectName.value,
        description: ''
      };
      this.logService.addActionSubject(this.actionSubject);
      this.actionSubjectFound = true;
      this.laa.action_subject_id = this.actionSubject.id;
      if (!this.isEdit) this.logService.toAdd.actsbj = this.actionSubject;
      this.creatingActionSubject = false;
      this.changeLogTitle();
      return;
    }

    if (this.actionSubjectFound) {
      this.creatingActionSubject = false;
      this.laa.action_subject_id = this.actionSubject.id;
      if (!this.isEdit) this.logService.toAdd.actsbj = this.actionSubject;
      this.changeLogTitle();
    }
  }
  changeLogTitle() {
    var a = !!this.action;
    var acs = !!this.actionSubject;
    var la = !!this.laa;
    this.logTitle.emit(
      `${a ? this.action.name : ''} ${acs ? this.actionSubject.name : ''} ${a ? this.action.adverb : ''} ${la ? this.laa.details : ''}`
    );
  }
}
