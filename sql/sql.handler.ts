
const sqlite3 = require('sqlite3');
import * as Knex from 'knex';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { up } from './migrations/20200409001409_init';
import {seed} from'./seeds/init';

let exists: boolean = true;
const logpath: string = os.homedir() + '\\Documents\\LifeLog\\';
var p = path.resolve(logpath, 'lifelog.db');
if (!fs.existsSync(logpath)) {
  fs.mkdirSync(logpath);
  exists = false;
} else if (!fs.existsSync(p)) {
  exists = false;
}




import { ipcMain, BrowserWindow, ipcRenderer } from 'electron';
import { SqlChartHandler } from './sql.chart.handler';



export class SqlHandler {
  static knex: Knex;

  constructor(win: BrowserWindow) {
    SqlHandler.knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: p
      }, useNullAsDefault: true
    });
    const knx = SqlHandler.knex;
    if (!exists) up(knx).then(() =>seed(knx))
      .catch(e => fs.writeFile(path.resolve(logpath, 'log.txt'), e, () => { }));
    this.createHooks(win, knx);
    SqlChartHandler.createHooks(knx, win);

  }
  private createHooks(win: BrowserWindow, knex: Knex) {

    ipcMain.on('get_logs', (event, times) => {
      //console.log(times);
      //let arr: LogData[] = [];
      SqlHandler.getLogs(times.from, times.till, knex).then(
        res => { win.webContents.send('got_logs', res); }
      );
    });
    this.createHook('get_day_logs', SqlHandler.getDayLogs, 'got_day_logs', win);
    this.createHook('get_log', SqlHandler.getLog, 'got_log', win);
    this.createHook('get_laa', SqlHandler.getLaa, 'got_laa', win);
    this.createHook('get_action', SqlHandler.getAction, 'got_action', win);
    this.createHook('get_actions', SqlHandler.getActions, 'got_actions', win);
    this.createHook('get_actions_by_name', SqlHandler.getActionByName, 'got_actions_by_name', win);
    this.createHook('get_action_subject', SqlHandler.getActionSubject, 'got_action_subject', win);
    this.createHook('get_action_subjects_by_name', SqlHandler.getActionSubjectByName, 'got_action_subjects_by_name', win);
    this.createHook('get_acts', SqlHandler.getActs, 'got_acts', win);
    this.createHook('get_categories', SqlHandler.getCategories, 'got_categories', win);
    this.createHook('get_category', SqlHandler.getCategory, 'got_category', win);
    this.createHook('get_keywords', SqlHandler.getKeywords, 'got_keywords', win);
    this.createHook('get_logkeywords', SqlHandler.getLogKeywords, 'got_keywords', win);
    this.createHook('get_keywords_for_log', SqlHandler.getKeywordsForLog, 'got_keywords_for_log', win);
    this.createHook('match_actions', SqlHandler.matchActions, 'matched_actions', win);
    this.createHook('match_action_subjects', SqlHandler.matchActionSubjects, 'matched_action_subjects', win);
    this.createHook('match_keywords', SqlHandler.matchKeywords, 'matched_keywords', win);
    this.createHook('match_categories', SqlHandler.matchCategories, 'matched_categories', win);

    this.createHook('add_log', SqlHandler.addLog, 'added_log', win);
    this.createHook('get_log_and_laa_subj_for_action', SqlHandler.getLogAndLaaSubjForAction, 'got_log_and_laa_subj_for_action', win);

    this.createHook('add_action', SqlHandler.addAction, 'added_action', win);
    this.createHook('add_action_subject', SqlHandler.addActionSubject, 'added_action_subject', win);
    this.createHook('add_laa', SqlHandler.addLaa, 'added_laa', win);
    this.createHook('add_category', SqlHandler.addCategory, 'added_category', win);
    this.createHook('add_keyword', SqlHandler.addKeyword, 'added_keyword', win);
    this.createHook('add_log_keyword', SqlHandler.addLogKeyword, 'added_log_keyword', win);

    this.createHook('update_log', SqlHandler.updateLog, 'updated_log', win);
    this.createHook('update_action', SqlHandler.updateAction, 'updated_action', win);
    this.createHook('update_action_subject', SqlHandler.updateActionSubject, 'updated_action_subject', win);
    this.createHook('update_laa', SqlHandler.updateLaa, 'updated_laa', win);
    this.createHook('update_category', SqlHandler.updateCategory, 'updated_category', win);
    this.createHook('update_keyword', SqlHandler.updateKeyword, 'updated_keyword', win);
    this.createHook('update_log_keyword', SqlHandler.updateLogKeyword, 'updated_log_keyword', win);

    this.createHook('delete_log', (id) => SqlHandler.delete(id, 'logs', knex), 'deleted_log', win);
    this.createHook('delete_action', (id) => SqlHandler.delete(id, 'actions', knex), 'deleted_action', win);
    this.createHook('delete_action_subject', (id) => SqlHandler.delete(id, 'action_subjects', knex), 'deleted_action_subject', win);
    this.createHook('delete_laa', (id) => SqlHandler.delete(id, 'laas', knex), 'deleted_laa', win);
    this.createHook('delete_category', (id) => SqlHandler.delete(id, 'categories', knex), 'deleted_category', win);
    this.createHook('delete_keyword', (id) => SqlHandler.delete(id, 'keywords', knex), 'deleted_keyword', win);
    this.createHook('delete_log_keyword', (id) => SqlHandler.delete(id, 'log_keywords', knex), 'deleted_log_keyword', win);

    ipcMain.on('add_log_with_laa', (evt, args) => {
      SqlHandler.addLogWithLaa(args.log, args.laa, knex).then(
        res => win.webContents.send('added_log_with_laa', res)
      )
    });
  }
  private createHook(hookName, func, resHookName, win) {

    ipcMain.on(hookName, (event, args) => {
      console.log(hookName);
      func(args, SqlHandler.knex).then(res => { win.webContents.send(resHookName, res); })//console.log('result:'); console.log(res);
    })
  }

  static getLogs(from: number, till: number, knex) {
    return knex('logs').whereBetween('start_date', [from, till]).select();
  }
  static getDayLogs(day: number, knex) {
    return knex('logs').where('start_date', day).select();
  }

  static getLog(id: number, knex) {
    return knex('logs').where('id', id).limit(1).select();
  }
  static getLogAndLaaSubjForAction(data, knex) {
    return knex('actions').join('laas', 'laas.action_id', 'actions.id')
      .join('action_subjects', 'action_subjects.id', 'laas.action_subject_id')
      .join('logs', 'logs.id', 'laas.log_id')
      .join('categories', 'categories.id', 'logs.category_id')
      .whereBetween('logs.start_date', [data.from, data.till])
      .andWhere('actions.id', data.action_id).select(
        'logs.id', 'logs.title', 'logs.note', 'logs.start_date', 'logs.start_time',
        'logs.end_date', 'logs.end_time', 'logs.color', 'logs.category_id',
        'logs.is_action', 'logs.is_timed', knex.raw('action_subjects.name AS action_subject_name'),
        knex.raw('categories.name AS category_name'),
        'laas.details', 'laas.data'
      )
  }
  static getLaa(logId: number, knex) {
    return knex('laas').where('log_id', logId).limit(1).select();
  }
  static getAction(actionId: number, knex) {
    return knex('actions').where('id', actionId).limit(1).select();
  }
  static getActionByName(name: string, knex) {
    return knex('actions').where('name', name).limit(1).select();
  }
  static getActionSubject(actionSubjectId: number, knex) {
    return knex('action_subjects').where('id', actionSubjectId).limit(1).select();
  }
  static getActionSubjectByName(name: string, knex) {
    return knex('action_subjects').where('name', name).limit(1).select();
  }
  static getActs(logId: number, knex) {
    const acts = { laa: null, action: null, actsbj: null };
    return SqlHandler.getLaa(logId, knex).then(laa => {
      acts.laa = laa[0];
      return SqlHandler.getAction(laa[0].action_id, knex).then(a => {
        acts.action = a[0];
        return SqlHandler.getActionSubject(laa[0].action_subject_id, knex).then(
          acs => {
            acts.actsbj = acs[0];
            return acts;
          })
      });
    });

  }
  static matchActions(str: string, knex) {
    return knex('actions').where('name', 'like', `%${str}%`).select().limit(50);
  }
  static matchActionSubjects(str: string, knex) {
    return knex('action_subjects').where('name', 'like', `%${str}%`).select().limit(50);
  }
  static getActions(nothing, knex) {
    if (nothing) {
      console.log(nothing)
      if (nothing.type && nothing.type !== 'Time') {
        return knex('actions').leftJoin('laas', 'laas.action_id', 'actions.id')
          .leftJoin('logs', 'logs.id', 'laas.log_id').where('logs.start_date', '>=', nothing.from)
          .andWhere('logs.end_date', '<=', nothing.till)
          .andWhere('logs.is_action', 1)
          .andWhere('actions.type', nothing.type)
          .select('actions.id', 'actions.name', 'logs.category_id',
            'actions.type', 'adverb', 'actions.color', 'actions.description').orderBy('actions.id');
      } else if (nothing.type && nothing.type === 'Time') {
        return knex('actions').leftJoin('laas', 'laas.action_id', 'actions.id')
          .leftJoin('logs', 'logs.id', 'laas.log_id').where('logs.start_date', '>=', nothing.from)
          .andWhere('logs.is_action', 1)
          .andWhere('logs.end_date', '<=', nothing.till)
          .andWhere('logs.is_timed', 1)
          .select('actions.id', 'actions.name', 'logs.category_id',
            'actions.type', 'adverb', 'actions.color', 'actions.description').orderBy('actions.id');
      }
      return knex('actions').leftJoin('laas', 'laas.action_id', 'actions.id')
        .leftJoin('logs', 'logs.id', 'laas.log_id').where('logs.start_date', '>=', nothing.from)
        .andWhere('logs.end_date', '<=', nothing.till)
        .select('actions.id', 'actions.name', 'logs.category_id',
          'actions.type', 'adverb', 'actions.color', 'actions.description'
        ).orderBy('actions.id');
    }
    return knex('actions').select();
  }
  static getCategories(nothing, knex) {
    if (nothing) {
      if (nothing.type && nothing.type === "Time") {
        return knex('categories')
          .leftJoin('logs', 'logs.category_id', 'categories.id').where('logs.start_date', '>=', nothing.from)
          .andWhere('logs.end_date', '<=', nothing.till)
          .andWhere('logs.is_action', 1).andWhere('logs.is_timed', 1)
          .select('categories.id', 'categories.name', 'categories.color', 'categories.description').distinct();
      } else if (nothing.type) {
        return knex('categories')
          .leftJoin('logs', 'logs.category_id', 'categories.id').where('logs.start_date', '>=', nothing.from)
          .andWhere('logs.end_date', '<=', nothing.till)
          .andWhere('logs.is_action', 1).andWhere('actions.type', nothing.type)
          .select('categories.id', 'categories.name', 'categories.color', 'categories.description').distinct();
      }

    }
    return knex('categories').select();
  }
  static getCategory(id: number, knex) {
    return knex('categories').where('id', id).select();
  }
  static matchCategories(str: string, knex) {
    return knex('categories').where('name', 'like', `%${str}%`).select().limit(50);
  }
  static getKeywords(nothing, knex) {
    if (nothing) {
      if (nothing.type && nothing.type === "Time") {
        return knex('keywords').leftJoin('log_keywords', 'log_keywords.keyword_id', 'keywords.id')
          .leftJoin('logs', 'logs.id', 'log_keywords.log_id').where('logs.start_date', '>=', nothing.from)
          .andWhere('logs.end_date', '<=', nothing.till)
          .andWhere('logs.is_action', 1).andWhere('logs.is_timed', 1)
          .select('keywords.id', 'keywords.name').distinct();
      } else if (nothing.type) {
        return knex('keywords').leftJoin('log_keywords', 'log_keywords.keyword_id', 'keywords.id')
          .leftJoin('logs', 'logs.id', 'log_keywords.log_id').where('logs.start_date', '>=', nothing.from)
          .andWhere('logs.end_date', '<=', nothing.till)
          .andWhere('logs.is_action', 1).andWhere('actions.type', nothing.type)
          .select('keywords.id', 'keywords.name').distinct();
      }

    }
    return knex('keywords').select();
  }
  static getLogKeywords(logId: number, knex) {
    return knex('log_keywords').where('log_id', logId).select();
  }
  static getKeywordsForLog(logId: number, knex) {
    return SqlHandler.getLogKeywords(logId, knex).then(res => (res).map(
      lk => lk.keyword_id
    )).then(res => knex('keywords').where('id', res).select());
  }
  static matchKeywords(str: string, knex) {
    return knex('keywords').where('name', 'like', `%${str}%`).select().limit(50);
  }




  static delete(id: number, from: string, knex) {
    console.log('deleting');
    return knex(from).where('id', id).del();
  }



  private static addData(data, into: string, knex) {
    return knex(into).insert(data);
  }
  static addLog(log, knex) {
    log.id = null;
    return SqlHandler.addData(log, 'logs', knex).then(
      id => { SqlHandler.addLaa(id[0], knex); return id; }
    );
  }
  static addLogWithLaa(log, laa: any, knex) {
    log.id = null;
    return SqlHandler.addData(log, 'logs', knex).then(
      id => {
        return SqlHandler.addData({
          log_id: id[0], action_id: laa.action_id,
          action_subject_id: laa.action_subject_id, details: laa.details
        }, 'laas', knex).then(s => { return s[0] });
        return id[0];
      }
    );
  }
  private static addLaa(logId: number, knex) {
    return SqlHandler.addData({ log_id: logId, action_id: null, action_subject_id: null }, 'laas', knex);
  }
  static addAction(action, knex) { return SqlHandler.addData(action, 'actions', knex) };
  static addActionSubject(action_subject, knex) { return SqlHandler.addData(action_subject, 'action_subjects', knex) };
  static addCategory(category, knex) { return SqlHandler.addData(category, 'categories', knex) };
  static addKeyword(keyword, knex) { return SqlHandler.addData(keyword, 'keywords', knex) };
  static addLogKeyword(lkw, knex) { return SqlHandler.addData(lkw, 'log_keywords', knex) };




  private static updateData(data: any,
    id: number,
    into: string, knex) {
    return knex(into).where('id', id).update(data);
  }
  static updateLog(data: any, knex) {
    return SqlHandler.updateData(data.data, data.id, 'logs', knex);
  }
  static updateLaa(data: any, knex) {
    return knex('laas').where('log_id', data.id).update(data.data);
  }
  static updateAction(data: any, knex) { return SqlHandler.updateData(data.data, data.id, 'actions', knex) };
  static updateActionSubject(data: any, knex) { return SqlHandler.updateData(data.data, data.id, 'action_subjects', knex) };
  static updateCategory(data: any, knex) { return SqlHandler.updateData(data.data, data.id, 'categories', knex) };
  static updateKeyword(data: any, knex) { return SqlHandler.updateData(data.data, data.id, 'keywords', knex) };
  static updateLogKeyword(data: any, knex) { return SqlHandler.updateData(data.data, data.id, 'log_keywords', knex) };//TODO:Fix

}
interface LogKeyword {
  log_id: number; keyword_id: number;
}
