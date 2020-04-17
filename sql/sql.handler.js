"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require('sqlite3');
var Knex = require("knex");
var os = require("os");
var fs = require("fs");
var path = require("path");
var _20200409001409_init_1 = require("./migrations/20200409001409_init");
var init_1 = require("./seeds/init");
var exists = true;
var logpath = os.homedir() + '\\Documents\\LifeLog\\';
var p = path.resolve(logpath, 'lifelog.db');
if (!fs.existsSync(logpath)) {
    fs.mkdirSync(logpath);
    exists = false;
}
else if (!fs.existsSync(p)) {
    exists = false;
}
var electron_1 = require("electron");
var sql_chart_handler_1 = require("./sql.chart.handler");
var SqlHandler = /** @class */ (function () {
    function SqlHandler(win) {
        SqlHandler.knex = Knex({
            client: 'sqlite3',
            connection: {
                filename: p
            }, useNullAsDefault: true
        });
        var knx = SqlHandler.knex;
        if (!exists)
            _20200409001409_init_1.up(knx).then(function () { return init_1.seed(knx); })
                .catch(function (e) { return fs.writeFile(path.resolve(logpath, 'log.txt'), e, function () { }); });
        this.createHooks(win, knx);
        sql_chart_handler_1.SqlChartHandler.createHooks(knx, win);
    }
    SqlHandler.prototype.createHooks = function (win, knex) {
        electron_1.ipcMain.on('get_logs', function (event, times) {
            //console.log(times);
            //let arr: LogData[] = [];
            SqlHandler.getLogs(times.from, times.till, knex).then(function (res) { win.webContents.send('got_logs', res); });
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
        this.createHook('delete_log', function (id) { return SqlHandler.delete(id, 'logs', knex); }, 'deleted_log', win);
        this.createHook('delete_action', function (id) { return SqlHandler.delete(id, 'actions', knex); }, 'deleted_action', win);
        this.createHook('delete_action_subject', function (id) { return SqlHandler.delete(id, 'action_subjects', knex); }, 'deleted_action_subject', win);
        this.createHook('delete_laa', function (id) { return SqlHandler.delete(id, 'laas', knex); }, 'deleted_laa', win);
        this.createHook('delete_category', function (id) { return SqlHandler.delete(id, 'categories', knex); }, 'deleted_category', win);
        this.createHook('delete_keyword', function (id) { return SqlHandler.delete(id, 'keywords', knex); }, 'deleted_keyword', win);
        this.createHook('delete_log_keyword', function (id) { return SqlHandler.delete(id, 'log_keywords', knex); }, 'deleted_log_keyword', win);
        electron_1.ipcMain.on('add_log_with_laa', function (evt, args) {
            SqlHandler.addLogWithLaa(args.log, args.laa, knex).then(function (res) { return win.webContents.send('added_log_with_laa', res); });
        });
    };
    SqlHandler.prototype.createHook = function (hookName, func, resHookName, win) {
        electron_1.ipcMain.on(hookName, function (event, args) {
            console.log(hookName);
            func(args, SqlHandler.knex).then(function (res) { win.webContents.send(resHookName, res); }); //console.log('result:'); console.log(res);
        });
    };
    SqlHandler.getLogs = function (from, till, knex) {
        return knex('logs').whereBetween('start_date', [from, till]).select();
    };
    SqlHandler.getDayLogs = function (day, knex) {
        return knex('logs').where('start_date', day).select();
    };
    SqlHandler.getLog = function (id, knex) {
        return knex('logs').where('id', id).limit(1).select();
    };
    SqlHandler.getLogAndLaaSubjForAction = function (data, knex) {
        return knex('actions').join('laas', 'laas.action_id', 'actions.id')
            .join('action_subjects', 'action_subjects.id', 'laas.action_subject_id')
            .join('logs', 'logs.id', 'laas.log_id')
            .join('categories', 'categories.id', 'logs.category_id')
            .whereBetween('logs.start_date', [data.from, data.till])
            .andWhere('actions.id', data.action_id).select('logs.id', 'logs.title', 'logs.note', 'logs.start_date', 'logs.start_time', 'logs.end_date', 'logs.end_time', 'logs.color', 'logs.category_id', 'logs.is_action', 'logs.is_timed', knex.raw('action_subjects.name AS action_subject_name'), knex.raw('categories.name AS category_name'), 'laas.details', 'laas.data');
    };
    SqlHandler.getLaa = function (logId, knex) {
        return knex('laas').where('log_id', logId).limit(1).select();
    };
    SqlHandler.getAction = function (actionId, knex) {
        return knex('actions').where('id', actionId).limit(1).select();
    };
    SqlHandler.getActionByName = function (name, knex) {
        return knex('actions').where('name', name).limit(1).select();
    };
    SqlHandler.getActionSubject = function (actionSubjectId, knex) {
        return knex('action_subjects').where('id', actionSubjectId).limit(1).select();
    };
    SqlHandler.getActionSubjectByName = function (name, knex) {
        return knex('action_subjects').where('name', name).limit(1).select();
    };
    SqlHandler.getActs = function (logId, knex) {
        var acts = { laa: null, action: null, actsbj: null };
        return SqlHandler.getLaa(logId, knex).then(function (laa) {
            acts.laa = laa[0];
            return SqlHandler.getAction(laa[0].action_id, knex).then(function (a) {
                acts.action = a[0];
                return SqlHandler.getActionSubject(laa[0].action_subject_id, knex).then(function (acs) {
                    acts.actsbj = acs[0];
                    return acts;
                });
            });
        });
    };
    SqlHandler.matchActions = function (str, knex) {
        return knex('actions').where('name', 'like', "%" + str + "%").select().limit(50);
    };
    SqlHandler.matchActionSubjects = function (str, knex) {
        return knex('action_subjects').where('name', 'like', "%" + str + "%").select().limit(50);
    };
    SqlHandler.getActions = function (nothing, knex) {
        if (nothing) {
            console.log(nothing);
            if (nothing.type && nothing.type !== 'Time') {
                return knex('actions').leftJoin('laas', 'laas.action_id', 'actions.id')
                    .leftJoin('logs', 'logs.id', 'laas.log_id').where('logs.start_date', '>=', nothing.from)
                    .andWhere('logs.end_date', '<=', nothing.till)
                    .andWhere('logs.is_action', 1)
                    .andWhere('actions.type', nothing.type)
                    .select('actions.id', 'actions.name', 'logs.category_id', 'actions.type', 'adverb', 'actions.color', 'actions.description').orderBy('actions.id');
            }
            else if (nothing.type && nothing.type === 'Time') {
                return knex('actions').leftJoin('laas', 'laas.action_id', 'actions.id')
                    .leftJoin('logs', 'logs.id', 'laas.log_id').where('logs.start_date', '>=', nothing.from)
                    .andWhere('logs.is_action', 1)
                    .andWhere('logs.end_date', '<=', nothing.till)
                    .andWhere('logs.is_timed', 1)
                    .select('actions.id', 'actions.name', 'logs.category_id', 'actions.type', 'adverb', 'actions.color', 'actions.description').orderBy('actions.id');
            }
            return knex('actions').leftJoin('laas', 'laas.action_id', 'actions.id')
                .leftJoin('logs', 'logs.id', 'laas.log_id').where('logs.start_date', '>=', nothing.from)
                .andWhere('logs.end_date', '<=', nothing.till)
                .select('actions.id', 'actions.name', 'logs.category_id', 'actions.type', 'adverb', 'actions.color', 'actions.description').orderBy('actions.id');
        }
        return knex('actions').select();
    };
    SqlHandler.getCategories = function (nothing, knex) {
        if (nothing) {
            if (nothing.type && nothing.type === "Time") {
                return knex('categories')
                    .leftJoin('logs', 'logs.category_id', 'categories.id').where('logs.start_date', '>=', nothing.from)
                    .andWhere('logs.end_date', '<=', nothing.till)
                    .andWhere('logs.is_action', 1).andWhere('logs.is_timed', 1)
                    .select('categories.id', 'categories.name', 'categories.color', 'categories.description').distinct();
            }
            else if (nothing.type) {
                return knex('categories')
                    .leftJoin('logs', 'logs.category_id', 'categories.id').where('logs.start_date', '>=', nothing.from)
                    .andWhere('logs.end_date', '<=', nothing.till)
                    .andWhere('logs.is_action', 1).andWhere('actions.type', nothing.type)
                    .select('categories.id', 'categories.name', 'categories.color', 'categories.description').distinct();
            }
        }
        return knex('categories').select();
    };
    SqlHandler.getCategory = function (id, knex) {
        return knex('categories').where('id', id).select();
    };
    SqlHandler.matchCategories = function (str, knex) {
        return knex('categories').where('name', 'like', "%" + str + "%").select().limit(50);
    };
    SqlHandler.getKeywords = function (nothing, knex) {
        if (nothing) {
            if (nothing.type && nothing.type === "Time") {
                return knex('keywords').leftJoin('log_keywords', 'log_keywords.keyword_id', 'keywords.id')
                    .leftJoin('logs', 'logs.id', 'log_keywords.log_id').where('logs.start_date', '>=', nothing.from)
                    .andWhere('logs.end_date', '<=', nothing.till)
                    .andWhere('logs.is_action', 1).andWhere('logs.is_timed', 1)
                    .select('keywords.id', 'keywords.name').distinct();
            }
            else if (nothing.type) {
                return knex('keywords').leftJoin('log_keywords', 'log_keywords.keyword_id', 'keywords.id')
                    .leftJoin('logs', 'logs.id', 'log_keywords.log_id').where('logs.start_date', '>=', nothing.from)
                    .andWhere('logs.end_date', '<=', nothing.till)
                    .andWhere('logs.is_action', 1).andWhere('actions.type', nothing.type)
                    .select('keywords.id', 'keywords.name').distinct();
            }
        }
        return knex('keywords').select();
    };
    SqlHandler.getLogKeywords = function (logId, knex) {
        return knex('log_keywords').where('log_id', logId).select();
    };
    SqlHandler.getKeywordsForLog = function (logId, knex) {
        return SqlHandler.getLogKeywords(logId, knex).then(function (res) { return (res).map(function (lk) { return lk.keyword_id; }); }).then(function (res) { return knex('keywords').where('id', res).select(); });
    };
    SqlHandler.matchKeywords = function (str, knex) {
        return knex('keywords').where('name', 'like', "%" + str + "%").select().limit(50);
    };
    SqlHandler.delete = function (id, from, knex) {
        console.log('deleting');
        return knex(from).where('id', id).del();
    };
    SqlHandler.addData = function (data, into, knex) {
        return knex(into).insert(data);
    };
    SqlHandler.addLog = function (log, knex) {
        log.id = null;
        return SqlHandler.addData(log, 'logs', knex).then(function (id) { SqlHandler.addLaa(id[0], knex); return id; });
    };
    SqlHandler.addLogWithLaa = function (log, laa, knex) {
        log.id = null;
        return SqlHandler.addData(log, 'logs', knex).then(function (id) {
            return SqlHandler.addData({
                log_id: id[0], action_id: laa.action_id,
                action_subject_id: laa.action_subject_id, details: laa.details
            }, 'laas', knex).then(function (s) { return s[0]; });
            return id[0];
        });
    };
    SqlHandler.addLaa = function (logId, knex) {
        return SqlHandler.addData({ log_id: logId, action_id: null, action_subject_id: null }, 'laas', knex);
    };
    SqlHandler.addAction = function (action, knex) { return SqlHandler.addData(action, 'actions', knex); };
    ;
    SqlHandler.addActionSubject = function (action_subject, knex) { return SqlHandler.addData(action_subject, 'action_subjects', knex); };
    ;
    SqlHandler.addCategory = function (category, knex) { return SqlHandler.addData(category, 'categories', knex); };
    ;
    SqlHandler.addKeyword = function (keyword, knex) { return SqlHandler.addData(keyword, 'keywords', knex); };
    ;
    SqlHandler.addLogKeyword = function (lkw, knex) { return SqlHandler.addData(lkw, 'log_keywords', knex); };
    ;
    SqlHandler.updateData = function (data, id, into, knex) {
        return knex(into).where('id', id).update(data);
    };
    SqlHandler.updateLog = function (data, knex) {
        return SqlHandler.updateData(data.data, data.id, 'logs', knex);
    };
    SqlHandler.updateLaa = function (data, knex) {
        return knex('laas').where('log_id', data.id).update(data.data);
    };
    SqlHandler.updateAction = function (data, knex) { return SqlHandler.updateData(data.data, data.id, 'actions', knex); };
    ;
    SqlHandler.updateActionSubject = function (data, knex) { return SqlHandler.updateData(data.data, data.id, 'action_subjects', knex); };
    ;
    SqlHandler.updateCategory = function (data, knex) { return SqlHandler.updateData(data.data, data.id, 'categories', knex); };
    ;
    SqlHandler.updateKeyword = function (data, knex) { return SqlHandler.updateData(data.data, data.id, 'keywords', knex); };
    ;
    SqlHandler.updateLogKeyword = function (data, knex) { return SqlHandler.updateData(data.data, data.id, 'log_keywords', knex); };
    ; //TODO:Fix
    return SqlHandler;
}());
exports.SqlHandler = SqlHandler;
//# sourceMappingURL=sql.handler.js.map