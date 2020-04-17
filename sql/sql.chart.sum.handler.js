"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sql_chart_base_queries_1 = require("./sql.chart.base.queries");
var SumHandler = /** @class */ (function () {
    function SumHandler() {
    }
    SumHandler.prototype.GetAction_s = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return sql_chart_base_queries_1.BaseQueries.GetAction_s(knex, data, type).andWhere('actions.type', 'Sum')
            .select('actions.id', 'actions.name', knex.raw('SUM(laas.data) AS sum')).orderBy('sum', 'desc').groupBy('actions.id');
    };
    //ACTION CATEGORY
    SumHandler.prototype.GetAction_s_WithSpecificCategories = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return sql_chart_base_queries_1.BaseQueries.GetAction_s_WithSpecificCategories(knex, data, type).andWhere('actions.type', 'Sum')
            .select('categories.id', 'categories.name', knex.raw('SUM(laas.data) AS sum')).orderBy('sum', 'desc').groupBy('categories.id');
    };
    SumHandler.prototype.GetAction_s_ForOneCategory = function (knex, data, type, categoryId) {
        if (type === void 0) { type = 'all_actions'; }
        return this.GetAction_s(knex, data, type).whereExists(function () {
            this.select('*').from('categories').whereRaw('categories.id = logs.category_id')
                .andWhere('categories.id', categoryId).andWhere('actions.type', 'Sum');
        }).orderBy('sum', 'desc').groupBy('actions.id');
    };
    SumHandler.prototype.GetAction_s_WithSpecificKeywords = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return sql_chart_base_queries_1.BaseQueries.GetAction_s_WithSpecificKeywords(knex, data, type).andWhere('actions.type', 'Sum')
            .select('keywords.id', 'keywords.name', knex.raw('SUM(laas.data) AS sum')).orderBy('sum', 'desc').groupBy('keywords.id');
    };
    //action category keywords
    SumHandler.prototype.GetAction_s_WithCategoryAndKeywords = function (knex, data, type) {
        // return SumHandler.GetAction_s_WithSpecificCategories(knex, data)
        //   .join('log_keywords', 'logs.id', 'log_keywords.log_id').groupBy('actions.id')
        //   .join('keywords', 'keywords.id', 'log_keywords.keyword_id').orderBy('sum','desc');
        if (type === void 0) { type = 'all_actions'; }
    };
    return SumHandler;
}());
exports.SumHandler = SumHandler;
//# sourceMappingURL=sql.chart.sum.handler.js.map