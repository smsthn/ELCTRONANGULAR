import { LogData , LAA, Log } from '../data/log.data';
import { Action } from '../data/action';
import { ActionSubject } from '../data/action.subject';
import { Category } from '../data/category';


export interface IDbHandler{

}

export interface IDAO{
  addLog(log: LogData): number;//id
  addAction(action:Action):number;
  addActionSubject(actionSubject: ActionSubject):number;
  addLaa(laa: LAA):number;
  addCategory(category: Category): number;

  getLog(id: number):LogData;
  getAction(id: number): Action;
  getLogAction(logId: number): Action;
  getActionSubject(id: number): ActionSubject;
  getLogActionSubject(logId: number): ActionSubject;
  getLaa(logId: number): LAA;
  getActs(logId: number): { action: Action, actionSubject: ActionSubject, laa: LAA };
  getLogs(from?: number, till?: number): LogData[];
  getActions(): Action[];
  getActionSubjects(): ActionSubject[];
  getCategories(): Category[];


  updateLog(log: LogData);
  updateAction(action: Action);
  updateActionSubject(actionSubject: ActionSubject);
  updateCategory(category: Category);

  updateLog(logId: number):boolean;
  updateAction(actionId: number):boolean;
  updateActionSubject(actionSubjectId: number):boolean;
  updateCategory(categoryId: number):boolean;
}
