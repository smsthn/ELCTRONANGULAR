"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var sql_chart_sum_handler_1 = require("./sql.chart.sum.handler");
var sql_chart_time_handler_1 = require("./sql.chart.time.handler");
var SqlChartHandler = /** @class */ (function () {
    function SqlChartHandler() {
    }
    SqlChartHandler.createHooks = function (knex, win) {
        var tp = '';
        var act = 'all_actions';
        var dataType = ['get_sum_data', 'get_time_data'];
        dataType.forEach(function (dt) {
            var handler = dt === 'get_sum_data' ?
                new sql_chart_sum_handler_1.SumHandler() : new sql_chart_time_handler_1.TimeHandler();
            electron_1.ipcMain.on(dt, function (evt, res) {
                var r = res;
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
                        return handler.GetAction_s_WithCategoryAndKeywords(knex, r, act).then(function (res) { return thenfunc(res, dt); });
                    }
                    else {
                        tp = '_with_categories';
                        return handler.GetAction_s_WithSpecificCategories(knex, r, act).then(function (res) {
                            if (r.categories.length >= 1) {
                                r.categories.forEach(function (c) {
                                    return handler.GetAction_s_ForOneCategory(knex, r, act, c.id).then(function (rs) {
                                        return win.webContents.send('got_category_actions', { type: dt, res: { key: c.name, data: rs } });
                                    });
                                });
                            }
                            return thenfunc(res, dt);
                        });
                    }
                }
                else if (r.Keywords) {
                    tp = 'with_keywords';
                    return handler.GetAction_s_WithSpecificKeywords(knex, r, act).then(function (res) { return thenfunc(res, dt); });
                }
                else {
                    tp = '';
                    return handler.GetAction_s(knex, r, act).then(function (res) {
                        if (dt === 'get_time_data') {
                        }
                        return thenfunc(res, dt);
                    });
                }
            });
        });
        var thenfunc = function (res, type) {
            win.webContents.send(act + tp, { type: type, res: res });
        };
    };
    return SqlChartHandler;
}());
exports.SqlChartHandler = SqlChartHandler;
//# sourceMappingURL=sql.chart.handler.js.map