
import { ChartData, ChartHandler } from './sql.chart.handler'
import { BaseQueries } from './sql.chart.base.queries';







export class TimeHandler implements ChartHandler{


  GetAction_s(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s(knex, data, type).andWhere('logs.is_timed', 1)
      .select('actions.id', 'actions.name', knex.raw('logs.id AS log_id'),knex.raw('logs.title AS log_title'),
        'logs.start_date', 'logs.end_date', 'logs.start_time', 'logs.end_time')
      .orderBy('actions.id');
  }
  //ACTION CATEGORY
  GetAction_s_WithSpecificCategories(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s_WithSpecificCategories(knex, data, type)
      .select('categories.id', 'categories.name', 'logs.start_date', 'logs.end_date', 'logs.start_time', 'logs.end_time')
      .orderBy('categories.id');
  }
  GetAction_s_ForOneCategory(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions', categoryId: number) {

    return this.GetAction_s(knex, data, type).whereExists(function () {
      this.select('*').from('categories').whereRaw('categories.id = logs.category_id')
        .andWhere('categories.id', categoryId)
    });
  }

  GetAction_s_WithSpecificKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s_WithSpecificKeywords(knex, data, type)
      .select('keywords.id', 'keywords.name', knex.raw('SUM(laas.data) AS sum')).orderBy('keywords.id')
  }

  //action category keywords
  GetAction_s_WithCategoryAndKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    // return SumHandler.GetAction_s_WithSpecificCategories(knex, data)
    //   .join('log_keywords', 'logs.id', 'log_keywords.log_id')
    //   .join('keywords', 'keywords.id', 'log_keywords.keyword_id').orderBy('sum','desc');

  }
  //TODO: ADD NO GROUPING IN  ORDER TO DO IT IN SERVICE
  //TODO: ADD Order By


}
