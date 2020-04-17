"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogData = /** @class */ (function () {
    function LogData(id, category_id, title, note, is_timed, is_action, start_time, end_time, start_date, end_date, color) {
        this.id = id;
        this.category_id = category_id;
        this.title = title;
        this.note = note;
        this.is_timed = is_timed;
        this.is_action = is_action;
        this.start_time = start_time;
        this.end_time = end_time;
        this.start_date = start_date;
        this.end_date = end_date;
        this.color = color;
        if (!this.id)
            this.id = -1;
        if (!this.category_id)
            this.category_id = 0;
        if (!this.title)
            this.title = '';
        if (!this.note)
            this.note = '';
        if (!this.is_timed)
            this.is_timed = false;
        if (!this.is_action)
            this.is_action = false;
        var now = new Date(Date.now());
        if (!this.start_time)
            this.start_time = (now.getHours() * 100) + now.getMinutes();
        if (!this.end_time)
            this.end_time = (now.getHours() * 100) + now.getMinutes();
        if (!this.start_date)
            this.start_date = (now.getFullYear() * 10000) + (now.getMonth() * 100) + now.getDate();
        if (!this.end_date)
            this.end_date = (now.getFullYear() * 10000) + (now.getMonth() * 100) + now.getDate();
        if (!this.color)
            this.color = LogColor.pink;
    }
    return LogData;
}());
exports.LogData = LogData;
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
})(LogColor = exports.LogColor || (exports.LogColor = {}));
function numAsDate(id) {
    var y = Math.floor(id / 10000);
    var m = (Math.floor((id / 100))) % 100;
    var d = id % 100;
    return new Date(y, m - 1, d);
}
exports.numAsDate = numAsDate;
//# sourceMappingURL=log.data.js.map