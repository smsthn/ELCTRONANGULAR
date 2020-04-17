import { LogData } from "./log.data";
import { Time } from "@angular/common";
import * as _moment from 'moment';

export class LogDate {

  constructor(d: Date = null) {
    if (d) {
      this.year = d.getFullYear();
      this.month = d.getMonth() + 1;
      this.day = d.getDate();
    }
  }
  static fromMDate(md: { year: number, month: number }): LogDate {
    return { year: md.year, month: md.month, day: 1 };
  }
  static fromDate(d: Date): LogDate {
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }
  static fromNumber(num: number): LogDate {
    return LogDateFromNumber(num);
  }
  static isBefore(ld1: LogDate, ld2: LogDate): boolean {
    return compareLogDates(ld1, ld2) < 0;
  }
  static isBeforeOrSame(ld1: LogDate, ld2: LogDate): boolean {
    return compareLogDates(ld1, ld2) <= 0;
  }
  static isAfter(ld1: LogDate, ld2: LogDate): boolean {
    return compareLogDates(ld1, ld2) > 0;
  }
  static isAfterOrSame(ld1: LogDate, ld2: LogDate): boolean {
    return compareLogDates(ld1, ld2) >= 0;
  }
  static isEqual(ld1: LogDate, ld2: LogDate): boolean {
    return compareLogDates(ld1, ld2) == 0;
  }
  year: number;
  month: number;
  day: number;
}

export function LogDateFromNumber(num: number): LogDate {
  var y = Math.floor(num / 10000);
  var m = (Math.floor((num / 100))) % 100;
  var d = num % 100;
  return { year: y, month: m, day: d };
}

export function NumberFromLogDate(d: LogDate): number {
  return ((d.year * 10000) + (d.month * 100) + (d.day));
}

export function LogDateFromString(num: string): LogDate {
  var y = +num.substring(0, 4);
  var m = +num.substring(4, 6);
  var d = num.length == 8 ? +num.substring(6, 8) : 1;//if given string from MDate return first day of month
  return { year: y, month: m, day: d };
}

export function StringFromLogDate(d: LogDate): string {
  return ((d.year * 10000) + (d.month * 100) + (d.day)).toString();
}

export function DateStringFromLog(log: LogData, withTime: boolean = false, endTime: boolean = false): string {
  const num = (withTime && log.is_timed && endTime) ? log.end_date : log.start_date;
  const y = Math.floor(num / 10000);
  const m = (Math.floor((num / 100))) % 100;
  const d = num % 100;
  const h = (withTime && log.is_timed) ?
    (endTime ? Math.floor(log.end_time / 100)
      : Math.floor(log.start_time)) : 0;
  const mm = (withTime && log.is_timed) ?
    (endTime ? Math.floor(log.end_time % 100) :
      Math.floor(log.start_time % 100)) : 0;
  var date = new Date(y, m - 1, d, h, mm);
  return (withTime && log.is_timed) ? date.toLocaleString() : date.toLocaleDateString();
}
export function DateFromNumber(num: number, h: number = 0, mm: number = 0): Date {
  const y = Math.floor(num / 10000);
  const m = (Math.floor((num / 100))) % 100;
  const d = num % 100;
  return new Date(y, m - 1, d, h, mm);
}
export function DateFromLogDate(ld: LogDate): Date {
  return new Date(ld.year, ld.month - 1, ld.day);
}
export function addDay(ld: LogDate, d: number): LogDate {
  ld.day += d;
  const numdays = new Date(ld.year, ld.month, 0).getDate();
  if (ld.day > numdays || ld.day <= 0) {
    const d = new Date(ld.year, ld.month - 1, ld.day);
    ld.day = d.getDate();
    ld.month = d.getMonth() + 1;
    ld.year = d.getUTCFullYear();
  }
  return ld;
}
export function evaluateLD(ld: LogDate): LogDate {
  const d = new Date(ld.year, ld.month - 1, ld.day);
  return new LogDate(d);

}

export function addMonth(ld: LogDate, m: number): LogDate {
  ld.month += m;

  if (ld.month > 12 || ld.month <= 0) {
    const d = new Date(ld.year, ld.month - 1, ld.day);
    ld.month = d.getMonth() + 1;
    ld.day = d.getDay();
    ld.year = d.getUTCFullYear();
  };
  return ld;
}
/**
 *result is < 0 if 1st param is before 2nd param. 0 if same . > 0 if 1st is after 2nd
 *
 * @export
 * @param {LogDate} ld1
 * @param {LogDate} ld2
 * @returns
 */
export function compareLogDates(ld1: LogDate, ld2: LogDate): number {
  return NumberFromLogDate(ld1) - NumberFromLogDate(ld2);
}
export interface LogTime { hour: number, minute: number }
export function NumberToTime(num: number): LogTime {
  return { hour: Math.floor(num / 100), minute: num % 100 };
}
export function TimeToNumber(time: LogTime):number { return (time.hour * 100) + time.minute };
export function NumberToMinutes(num: number) {
  const lt = NumberToTime(num);
  return (lt.hour * 60) + lt.minute;
}
export function MinutesToNumber(min: number): number{return ((Math.floor(min / 60) * 100) + (min % 60));}
