

import { ChartData } from './sql.chart.handler'





export class BaseQueries {


  private static BasicActionQuery(knex, data: ChartData) {
    return knex('logs')
      .join('laas', 'logs.id', 'laas.log_id')
      .join('actions', 'laas.action_id', 'actions.id')
      .where('logs.is_action', 1)
      .andWhere('logs.start_date', '>=', data.from).andWhere('logs.end_date', '<=', data.till)
      .select(knex.raw('actions.id AS action_id'), knex.raw('category_id AS category_id'));
  }

  private static WhereAction(knex, data: ChartData) {
    return BaseQueries.BasicActionQuery(knex, data).
      where('actions.id', data.action.id)
  }
  private static WhereActions(knex, data: ChartData) {
    const aids = data.actions.map(a => a.id);
    if (data.action) aids.push(data.action.id);
    return BaseQueries.BasicActionQuery(knex, data).whereIn('actions.id', aids)
  }
  //ACTION
  private static getActionSum(knex, data: ChartData) {
    return BaseQueries.WhereAction(knex, data)
  }

  private static getActionsSum(knex, data: ChartData) {
    return BaseQueries.WhereActions(knex, data)

  }
  private static getAllActionsSum(knex, data: ChartData) {
    return BaseQueries.BasicActionQuery(knex, data)
  }
  static GetAction_s(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return (type === 'all_actions' ? BaseQueries.getAllActionsSum(knex, data)
      : (type === 'many_actions' ? BaseQueries.getActionsSum(knex, data)
        : BaseQueries.getActionSum(knex, data)))
  }
  //ACTION CATEGORY
  private static getActionSumWhereCategory(knex, data: ChartData) {
    return BaseQueries.WhereAction(knex, data)
      .join('categories', 'logs.category_id', 'categories.id')
  }
  private static getActionsSumWhereCategory(knex, data: ChartData) {
    return BaseQueries.WhereActions(knex, data)
      .join('categories', 'logs.category_id', 'categories.id')
  }
  private static getAllActionSumWhereCategory(knex, data: ChartData) {
    return BaseQueries.BasicActionQuery(knex, data)
      .join('categories', 'logs.category_id', 'categories.id')

  }
  static GetAction_s_WithSpecificCategories(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return (type === 'all_actions' ? BaseQueries.getAllActionSumWhereCategory(knex, data)
      : (type === 'many_actions' ? BaseQueries.getActionsSumWhereCategory(knex, data)
        : BaseQueries.getActionSumWhereCategory(knex, data)))
      .whereIn('categories.id', data.categories.map(c => c.id));
  }
  static GetAction_s_ForOneCategory(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions', categoryId: number) {
    return BaseQueries.GetAction_s(knex, data, type).whereExists(function () {
      this.select('*').from('categories').whereRaw('categories.id = logs.category_id')
        .andWhere('categories.id', categoryId)
    });
  }
  //
  private static getActionSumWhereKeyword(knex, data: ChartData) {
    return BaseQueries.WhereAction(knex, data)
      .join('log_keywords', 'logs.id', 'log_keywords.log_id')
      .join('keywords', 'keywords.id', 'log_keywords.keyword_id')
  }
  private static getActionsSumWhereKeyword(knex, data: ChartData) {
    return BaseQueries.WhereActions(knex, data)
      .join('log_keywords', 'logs.id', 'log_keywords.log_id')
      .join('keywords', 'keywords.id', 'log_keywords.keyword_id')
  }
  private static getAllActionSumWhereKeyword(knex, data: ChartData) {
    return BaseQueries.BasicActionQuery(knex, data)
      .join('log_keywords', 'logs.id', 'log_keywords.log_id')
      .join('keywords', 'keywords.id', 'log_keywords.keyword_id')
  }
  static GetAction_s_WithSpecificKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return (type === 'all_actions' ? BaseQueries.getAllActionSumWhereKeyword(knex, data)
      : (type === 'many_actions' ? BaseQueries.getActionsSumWhereKeyword(knex, data)
        : BaseQueries.getActionSumWhereKeyword(knex, data))).whereIn('keywords.id', data.Keywords.map(k => k.id));
  }

  //action category keywords
  static GetAction_s_WithCategoryAndKeywords(knex, data: ChartData, type: 'one_action' | 'many_actions' | 'all_actions' = 'all_actions') {
    return BaseQueries.GetAction_s_WithSpecificCategories(knex, data)
      .join('log_keywords', 'logs.id', 'log_keywords.log_id')
      .join('keywords', 'keywords.id', 'log_keywords.keyword_id');

  }
  //TODO: ADD NO GROUPING IN  ORDER TO DO IT IN SERVICE
  //TODO: ADD Order By
}


