"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sql_chart_base_queries_1 = require("./sql.chart.base.queries");
var TimeHandler = /** @class */ (function () {
    function TimeHandler() {
    }
    TimeHandler.prototype.GetAction_s = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return sql_chart_base_queries_1.BaseQueries.GetAction_s(knex, data, type).andWhere('logs.is_timed', 1)
            .select('actions.id', 'actions.name', knex.raw('logs.id AS log_id'), knex.raw('logs.title AS log_title'), 'logs.start_date', 'logs.end_date', 'logs.start_time', 'logs.end_time')
            .orderBy('actions.id');
    };
    //ACTION CATEGORY
    TimeHandler.prototype.GetAction_s_WithSpecificCategories = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return sql_chart_base_queries_1.BaseQueries.GetAction_s_WithSpecificCategories(knex, data, type)
            .select('categories.id', 'categories.name', 'logs.start_date', 'logs.end_date', 'logs.start_time', 'logs.end_time')
            .orderBy('categories.id');
    };
    TimeHandler.prototype.GetAction_s_ForOneCategory = function (knex, data, type, categoryId) {
        if (type === void 0) { type = 'all_actions'; }
        return this.GetAction_s(knex, data, type).whereExists(function () {
            this.select('*').from('categories').whereRaw('categories.id = logs.category_id')
                .andWhere('categories.id', categoryId);
        });
    };
    TimeHandler.prototype.GetAction_s_WithSpecificKeywords = function (knex, data, type) {
        if (type === void 0) { type = 'all_actions'; }
        return sql_chart_base_queries_1.BaseQueries.GetAction_s_WithSpecificKeywords(knex, data, type)
            .select('keywords.id', 'keywords.name', knex.raw('SUM(laas.data) AS sum')).orderBy('keywords.id');
    };
    //action category keywords
    TimeHandler.prototype.GetAction_s_WithCategoryAndKeywords = function (knex, data, type) {
        // return SumHandler.GetAction_s_WithSpecificCategories(knex, data)
        //   .join('log_keywords', 'logs.id', 'log_keywords.log_id')
        //   .join('keywords', 'keywords.id', 'log_keywords.keyword_id').orderBy('sum','desc');
        if (type === void 0) { type = 'all_actions'; }
    };
    return TimeHandler;
}());
exports.TimeHandler = TimeHandler;
//# sourceMappingURL=sql.chart.time.handler.js.map