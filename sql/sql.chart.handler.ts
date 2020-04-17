


import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

import {ipcMain} from 'electron';
import { SumHandler } from './sql.chart.sum.handler';
import { TimeHandler } from './sql.chart.time.handler';


export interface ChartHandler {
  GetAction_s(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions');
  GetAction_s_WithSpecificCategories(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions');
  GetAction_s_ForOneCategory(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions', categoryId: number);
  GetAction_s_WithSpecificKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions');
  GetAction_s_WithCategoryAndKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions');
}



export class SqlChartHandler {

  static createHooks(knex, win) {

    let tp: '' | '_with_categories' | 'with_keywords' | 'with_categories_keywords' = '';
    let act: 'one_action' | 'many_actions' | 'all_actions'
      = 'all_actions';
    let dataType = ['get_sum_data', 'get_time_data'];
    dataType.forEach(
      dt => {
        const handler: ChartHandler = dt === 'get_sum_data' ?
          new SumHandler() : new TimeHandler();
        ipcMain.on(dt, (evt, res) => {
          const r = res as ChartData;
          act = r.actions ? 'many_actions' : (r.action ? 'one_action' : 'all_actions');
          // if (act === 'one_action' &&
          //   ((r.categories && r.categories.length > 1) || (r.Keywords && r.Keywords.length > 1))) {
          //   if (r.categories && r.categories.length > 1) {
          //     return SumHandler.GetAction_s(knex, r, act).join('categories','categories.id','log.category_id')
          //       .then(res => thenfunc(res,dt))
          //   } else {
          //     return SumHandler.GetAction_s(knex, r, act)
          //       .then(res => thenfunc(res,dt))
          //   }

          //   }
          if (r.categories) {
            if (r.Keywords) {
              tp = 'with_categories_keywords';
              return handler.GetAction_s_WithCategoryAndKeywords(knex, r, act).then(res => thenfunc(res,dt))
            } else {
              tp = '_with_categories';
              return handler.GetAction_s_WithSpecificCategories(knex, r, act).then(
                res => {
                  if (r.categories.length >= 1) {
                    r.categories.forEach(c => {

                      return handler.GetAction_s_ForOneCategory(
                        knex, r, act, c.id).then(rs =>
                          win.webContents.send('got_category_actions', { type: dt, res: { key: c.name, data: rs} })
                        )
                    })
                  }
                  return thenfunc(res,dt);
                })
            }
          } else if (r.Keywords) {
            tp = 'with_keywords';
            return handler.GetAction_s_WithSpecificKeywords(knex, r, act).then(res => thenfunc(res,dt))
          } else {
            tp = '';

            return handler.GetAction_s(knex, r, act).then(res => {
              if (dt === 'get_time_data') {
              }
              return thenfunc(res,dt);
            })
          }
        }
        );
      }
    );


    const thenfunc = (res,type) => {

      win.webContents.send(act + tp, {type:type,res:res});
    };
  }
}


export type ChartData = {
  action?: {id,name,color,type,adverb,description}, from: number, till: number,
  actions?: { id, name, color, type, adverb, description }[], categories?: { id, name, color, description }[], Keywords?: { id, name, description }[],
}


