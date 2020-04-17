

import { ChartData, ChartHandler } from './sql.chart.handler'
import { BaseQueries } from './sql.chart.base.queries';





export class SumHandler implements ChartHandler {


  GetAction_s(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s(knex, data, type).andWhere('actions.type','Sum')
      .select('actions.id', 'actions.name', knex.raw('SUM(laas.data) AS sum')).orderBy('sum', 'desc').groupBy('actions.id');
  }
  //ACTION CATEGORY
  GetAction_s_WithSpecificCategories(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s_WithSpecificCategories(knex, data, type).andWhere('actions.type','Sum')
      .select('categories.id', 'categories.name', knex.raw('SUM(laas.data) AS sum')).orderBy('sum', 'desc').groupBy('categories.id');
  }
  GetAction_s_ForOneCategory(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions', categoryId: number) {

    return this.GetAction_s(knex, data, type).whereExists(function () {
      this.select('*').from('categories').whereRaw('categories.id = logs.category_id')
        .andWhere('categories.id', categoryId).andWhere('actions.type','Sum')
    }).orderBy('sum', 'desc').groupBy('actions.id');
  }

  GetAction_s_WithSpecificKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s_WithSpecificKeywords(knex, data, type).andWhere('actions.type','Sum')
      .select('keywords.id', 'keywords.name', knex.raw('SUM(laas.data) AS sum')).orderBy('sum', 'desc').groupBy('keywords.id');
  }

  //action category keywords
  GetAction_s_WithCategoryAndKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    // return SumHandler.GetAction_s_WithSpecificCategories(knex, data)
    //   .join('log_keywords', 'logs.id', 'log_keywords.log_id').groupBy('actions.id')
    //   .join('keywords', 'keywords.id', 'log_keywords.keyword_id').orderBy('sum','desc');

  }
  //TODO: ADD NO GROUPING IN  ORDER TO DO IT IN SERVICE
  //TODO: ADD Order By
}


