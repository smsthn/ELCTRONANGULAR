"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogDate = /** @class */ (function () {
    function LogDate(d) {
        if (d === void 0) { d = null; }
        if (d) {
            this.year = d.getFullYear();
            this.month = d.getMonth() + 1;
            this.day = d.getDate();
        }
    }
    LogDate.fromMDate = function (md) {
        return { year: md.year, month: md.month, day: 1 };
    };
    LogDate.fromDate = function (d) {
        return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    };
    LogDate.fromNumber = function (num) {
        return LogDateFromNumber(num);
    };
    LogDate.isBefore = function (ld1, ld2) {
        return compareLogDates(ld1, ld2) < 0;
    };
    LogDate.isBeforeOrSame = function (ld1, ld2) {
        return compareLogDates(ld1, ld2) <= 0;
    };
    LogDate.isAfter = function (ld1, ld2) {
        return compareLogDates(ld1, ld2) > 0;
    };
    LogDate.isAfterOrSame = function (ld1, ld2) {
        return compareLogDates(ld1, ld2) >= 0;
    };
    LogDate.isEqual = function (ld1, ld2) {
        return compareLogDates(ld1, ld2) == 0;
    };
    return LogDate;
}());
exports.LogDate = LogDate;
function LogDateFromNumber(num) {
    var y = Math.floor(num / 10000);
    var m = (Math.floor((num / 100))) % 100;
    var d = num % 100;
    return { year: y, month: m, day: d };
}
exports.LogDateFromNumber = LogDateFromNumber;
function NumberFromLogDate(d) {
    return ((d.year * 10000) + (d.month * 100) + (d.day));
}
exports.NumberFromLogDate = NumberFromLogDate;
function LogDateFromString(num) {
    var y = +num.substring(0, 4);
    var m = +num.substring(4, 6);
    var d = num.length == 8 ? +num.substring(6, 8) : 1; //if given string from MDate return first day of month
    return { year: y, month: m, day: d };
}
exports.LogDateFromString = LogDateFromString;
function StringFromLogDate(d) {
    return ((d.year * 10000) + (d.month * 100) + (d.day)).toString();
}
exports.StringFromLogDate = StringFromLogDate;
function DateStringFromLog(log, withTime, endTime) {
    if (withTime === void 0) { withTime = false; }
    if (endTime === void 0) { endTime = false; }
    var num = (withTime && log.is_timed && endTime) ? log.end_date : log.start_date;
    var y = Math.floor(num / 10000);
    var m = (Math.floor((num / 100))) % 100;
    var d = num % 100;
    var h = (withTime && log.is_timed) ?
        (endTime ? Math.floor(log.end_time / 100)
            : Math.floor(log.start_time)) : 0;
    var mm = (withTime && log.is_timed) ?
        (endTime ? Math.floor(log.end_time % 100) :
            Math.floor(log.start_time % 100)) : 0;
    var date = new Date(y, m - 1, d, h, mm);
    return (withTime && log.is_timed) ? date.toLocaleString() : date.toLocaleDateString();
}
exports.DateStringFromLog = DateStringFromLog;
function DateFromNumber(num, h, mm) {
    if (h === void 0) { h = 0; }
    if (mm === void 0) { mm = 0; }
    var y = Math.floor(num / 10000);
    var m = (Math.floor((num / 100))) % 100;
    var d = num % 100;
    return new Date(y, m - 1, d, h, mm);
}
exports.DateFromNumber = DateFromNumber;
function DateFromLogDate(ld) {
    return new Date(ld.year, ld.month - 1, ld.day);
}
exports.DateFromLogDate = DateFromLogDate;
function addDay(ld, d) {
    ld.day += d;
    var numdays = new Date(ld.year, ld.month, 0).getDate();
    if (ld.day > numdays || ld.day <= 0) {
        var d_1 = new Date(ld.year, ld.month - 1, ld.day);
        ld.day = d_1.getDate();
        ld.month = d_1.getMonth() + 1;
        ld.year = d_1.getUTCFullYear();
    }
    return ld;
}
exports.addDay = addDay;
function evaluateLD(ld) {
    var d = new Date(ld.year, ld.month - 1, ld.day);
    return new LogDate(d);
}
exports.evaluateLD = evaluateLD;
function addMonth(ld, m) {
    ld.month += m;
    if (ld.month > 12 || ld.month <= 0) {
        var d = new Date(ld.year, ld.month - 1, ld.day);
        ld.month = d.getMonth() + 1;
        ld.day = d.getDay();
        ld.year = d.getUTCFullYear();
    }
    ;
    return ld;
}
exports.addMonth = addMonth;
/**
 *result is < 0 if 1st param is before 2nd param. 0 if same . > 0 if 1st is after 2nd
 *
 * @export
 * @param {LogDate} ld1
 * @param {LogDate} ld2
 * @returns
 */
function compareLogDates(ld1, ld2) {
    return NumberFromLogDate(ld1) - NumberFromLogDate(ld2);
}
exports.compareLogDates = compareLogDates;
function NumberToTime(num) {
    return { hour: Math.floor(num / 100), minute: num % 100 };
}
exports.NumberToTime = NumberToTime;
function TimeToNumber(time) { return (time.hour * 100) + time.minute; }
exports.TimeToNumber = TimeToNumber;
;
function NumberToMinutes(num) {
    var lt = NumberToTime(num);
    return (lt.hour * 60) + lt.minute;
}
exports.NumberToMinutes = NumberToMinutes;
function MinutesToNumber(min) { return ((Math.floor(min / 60) * 100) + (min % 60)); }
exports.MinutesToNumber = MinutesToNumber;
//# sourceMappingURL=log.date.js.map