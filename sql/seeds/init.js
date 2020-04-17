"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function seed(knex) {
    return __awaiter(this, void 0, void 0, function () {
        function createactions() {
            return knex.batchInsert('actions', create.sttActs, 50);
        }
        function createactionSubjects() {
            return knex.batchInsert('action_subjects', create.sttActSubs, 50);
        }
        function createLogs() {
            return knex.batchInsert('logs', create.sttLogs, 50);
        }
        function createLaas() {
            return knex.batchInsert('laas', create.sttLAAs, 50);
        }
        var create;
        return __generator(this, function (_a) {
            create = new createThings();
            // Deletes ALL existing entries
            return [2 /*return*/, knex('categories').insert(create.sttctgs)
                    .then(createactions)
                    .then(createactionSubjects)
                    .then(createLogs)
                    .then(createLaas)];
        });
    });
}
exports.seed = seed;
;
var createThings = /** @class */ (function () {
    function createThings() {
        this.sttctgs = [
            { id: 0, name: "ctg0", description: "ctgdescription0", color: LogColor.blue },
            { id: 1, name: "ctg1", description: "ctgdescription1", color: LogColor.green },
            { id: 2, name: "ctg2", description: "ctgdescription2", color: LogColor.purple },
            { id: 3, name: "ctg3", description: "ctgdescription3", color: LogColor.yellow },
            { id: 4, name: "ctg4", description: "ctgdescription4", color: LogColor.darkgreen },
            { id: 5, name: "ctg5", description: "ctgdescription5", color: LogColor.white, },
            { id: 6, name: "ctg6", description: "ctgdescription6", color: LogColor.bluegray },
            { id: 7, name: "ctg7", description: "ctgdescription7", color: LogColor.red },
        ];
        this.ctgs = this.sttctgs;
        this.sttLogs = this.createLogs();
        this.sttActs = this.createActions();
        this.sttActSubs = this.createActionSubjects();
        this.sttLAAs = this.createLAAs();
    }
    createThings.prototype.createLogs = function () {
        var _this = this;
        var enumvals = Object.values(LogColor);
        var arr = new Array(10000).fill(null).map(function (v, i) {
            //const d = 20000000 + ((Math.floor(Math.random() * 20) + 1) * 10000) + ((Math.floor(Math.random() * 12) + 1) * 100) + Math.floor(Math.random() * 31) + 1;
            var d = _this.createDate();
            //const t = { hours: Math.floor(Math.random() * 22), minutes: Math.floor(Math.random() * 60) };
            var t = _this.createStartTime();
            var t2 = _this.createEndTime();
            //const t2 = Object.assign({}, t, { hours: t.hours + 1 });
            return {
                id: i,
                category_id: Math.floor(Math.random() * _this.ctgs.length),
                start_date: d,
                end_date: d + Math.floor(Math.random() * 2),
                start_time: t,
                end_time: t2,
                is_action: Math.floor(Math.random() * 2),
                is_timed: Math.floor(Math.random() * 2),
                color: enumvals[Math.floor(Math.random() * enumvals.length)],
                title: "Logasfdsfsadfgafgasdfsadfasdfasdfasdfsadfadf" + i,
                note: "Note" + i
            };
        });
        return arr;
    };
    createThings.prototype.createDate = function () {
        var y = (((Math.floor(Math.random() * 20) + 1) + 2000) * 10000);
        var m = ((Math.floor(Math.random() * 12) + 1) * 100);
        var d = ((Math.floor(Math.random() * 31) + 1));
        return y + m + d;
    };
    createThings.prototype.createStartTime = function () {
        return (((Math.floor(Math.random() * 12)) + 1) * 100) + (Math.floor(Math.random() * 55) + 1);
    };
    createThings.prototype.createEndTime = function () {
        return (((Math.floor(Math.random() * 11)) + 13) * 100) + (Math.floor(Math.random() * 55) + 1);
    };
    createThings.prototype.createActions = function () {
        var enumvals = Object.values(LogColor);
        var enumvals2 = Object.values(ActionType);
        var arr = new Array(1000).fill(null).map(function (v, i) {
            return {
                id: i, name: "action" + i, type: enumvals2[Math.floor(Math.random() * enumvals2.length)],
                description: "actiondescription" + i, color: enumvals[Math.floor(Math.random() * enumvals.length)],
                adverb: "actadv" + i
            };
        });
        return arr;
    };
    createThings.prototype.createActionSubjects = function () {
        var arr = new Array(1000).fill(null).map(function (v, i) {
            return {
                id: i, name: "actionSubject" + i,
                description: "actionSubjectdescription" + i
            };
        });
        return arr;
    };
    createThings.prototype.createLAAs = function () {
        var _this = this;
        var arr = new Array(10000).fill(null).map(function (v, i) {
            return {
                log_id: i,
                action_id: Math.floor(Math.random() * 1000),
                action_subject_id: Math.floor(Math.random() * 1000),
                details: "actionDetails" + i, data: Math.floor(Math.random() * 100 + 1)
            };
        });
        new Array(5000).fill(null).forEach(function (v, i) {
            var id = Math.floor(Math.random() * 10000);
            if (!_this.sttLogs[id].is_action) {
                var la = arr.find(function (l) { return l.log_id === id; });
                var an = _this.sttActs[la.action_id].name;
                var ad = _this.sttActs[la.action_id].adverb;
                var acs = _this.sttActSubs[la.action_subject_id].name;
                var d = la.details;
                _this.sttLogs[id].is_action = true;
                _this.sttLogs[id].title = an + " " + acs + " " + ad + " " + d;
            }
        });
        return arr;
    };
    return createThings;
}());
var LogColor;
(function (LogColor) {
    LogColor["purple"] = "purple-log";
    LogColor["red"] = "red-log";
    LogColor["blue"] = "blue-log";
    LogColor["lightblue"] = "light-blue-log";
    LogColor["green"] = "green-log";
    LogColor["darkgreen"] = "dark-green-log";
    LogColor["white"] = "white-log";
    LogColor["orange"] = "orange-log";
    LogColor["yellow"] = "yellow-log";
    LogColor["bluegray"] = "blue-gray-log";
    LogColor["pink"] = "pink-log";
})(LogColor || (LogColor = {}));
var ActionType;
(function (ActionType) {
    ActionType["None"] = "None";
    ActionType["Count"] = "Count";
    ActionType["Sum"] = "Sum";
    ActionType["String"] = "String";
})(ActionType || (ActionType = {}));
//# sourceMappingURL=init.js.map