"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseQueries = /** @class */ (function () {
    function BaseQueries() {
    }
    BaseQueries.BasicActionQuery = function (knex, data) {
        return knex('logs')
            .join('laas', 'logs.id', 'laas.log_id')
            .join('actions', 'laas.action_id', 'actions.id')
            .where('logs.is_action', 1)
            .andWhere('logs.start_date', '>=', data.from).andWhere('logs.end_date', '<=', data.till)
            .select(knex.raw('actions.id AS action_id'), knex.raw('category_id AS category_id'));
    };
    BaseQueries.WhereAction = function (knex, data) {
        return BaseQueries.BasicActionQuery(knex, data).
            where('actions.id', data.action.id);
    };
    BaseQueries.WhereActions = function (knex, data) {
        var aids = data.actions.map(function (a) { return a.id; });
        if (data.action)
            aids.push(data.action.id);
        return BaseQueries.BasicActionQuery(knex, data).whereIn('actions.id', aids);
    };
    //ACTION
    BaseQueries.getActionSum = function (knex, data) {
        return BaseQueries.WhereAction(knex, data);
    };
    BaseQueries.getActionsSum = function (knex, data) {
        return BaseQueries.WhereActions(knex, data);
    };
    BaseQueries.getAllActionsSum = function (knex, data) {
        return BaseQueries.BasicActionQuery(knex, data);
    };
    BaseQueries.GetAction_s = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return (type === 'all_actions' ? BaseQueries.getAllActionsSum(knex, data)
            : (type === 'many_actions' ? BaseQueries.getActionsSum(knex, data)
                : BaseQueries.getActionSum(knex, data)));
    };
    //ACTION CATEGORY
    BaseQueries.getActionSumWhereCategory = function (knex, data) {
        return BaseQueries.WhereAction(knex, data)
            .join('categories', 'logs.category_id', 'categories.id');
    };
    BaseQueries.getActionsSumWhereCategory = function (knex, data) {
        return BaseQueries.WhereActions(knex, data)
            .join('categories', 'logs.category_id', 'categories.id');
    };
    BaseQueries.getAllActionSumWhereCategory = function (knex, data) {
        return BaseQueries.BasicActionQuery(knex, data)
            .join('categories', 'logs.category_id', 'categories.id');
    };
    BaseQueries.GetAction_s_WithSpecificCategories = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return (type === 'all_actions' ? BaseQueries.getAllActionSumWhereCategory(knex, data)
            : (type === 'many_actions' ? BaseQueries.getActionsSumWhereCategory(knex, data)
                : BaseQueries.getActionSumWhereCategory(knex, data)))
            .whereIn('categories.id', data.categories.map(function (c) { return c.id; }));
    };
    BaseQueries.GetAction_s_ForOneCategory = function (knex, data, type, categoryId) {
        if (type === void 0) { type = 'all_actions'; }
        return BaseQueries.GetAction_s(knex, data, type).whereExists(function () {
            this.select('*').from('categories').whereRaw('categories.id = logs.category_id')
                .andWhere('categories.id', categoryId);
        });
    };
    //
    BaseQueries.getActionSumWhereKeyword = function (knex, data) {
        return BaseQueries.WhereAction(knex, data)
            .join('log_keywords', 'logs.id', 'log_keywords.log_id')
            .join('keywords', 'keywords.id', 'log_keywords.keyword_id');
    };
    BaseQueries.getActionsSumWhereKeyword = function (knex, data) {
        return BaseQueries.WhereActions(knex, data)
            .join('log_keywords', 'logs.id', 'log_keywords.log_id')
            .join('keywords', 'keywords.id', 'log_keywords.keyword_id');
    };
    BaseQueries.getAllActionSumWhereKeyword = function (knex, data) {
        return BaseQueries.BasicActionQuery(knex, data)
            .join('log_keywords', 'logs.id', 'log_keywords.log_id')
            .join('keywords', 'keywords.id', 'log_keywords.keyword_id');
    };
    BaseQueries.GetAction_s_WithSpecificKeywords = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return (type === 'all_actions' ? BaseQueries.getAllActionSumWhereKeyword(knex, data)
            : (type === 'many_actions' ? BaseQueries.getActionsSumWhereKeyword(knex, data)
                : BaseQueries.getActionSumWhereKeyword(knex, data))).whereIn('keywords.id', data.Keywords.map(function (k) { return k.id; }));
    };
    //action category keywords
    BaseQueries.GetAction_s_WithCategoryAndKeywords = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return BaseQueries.GetAction_s_WithSpecificCategories(knex, data)
            .join('log_keywords', 'logs.id', 'log_keywords.log_id')
            .join('keywords', 'keywords.id', 'log_keywords.keyword_id');
    };
    return BaseQueries;
}());
exports.BaseQueries = BaseQueries;
//# sourceMappingURL=sql.chart.base.queries.js.map