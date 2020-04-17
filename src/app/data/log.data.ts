import { Time } from "@angular/common";


export interface Log{
    category_id?: number,
    title?: string,
    note?: string,
    is_timed?: boolean,
    is_action?: boolean,
    start_time?: number,
    end_time?: number,
    start_date?: number,
    end_date?: number,
    color?: LogColor
}

export class LogData implements Log{

  constructor(public id?: number,
    public category_id?: number,
    public title?: string,
    public note?: string,
    public is_timed?: boolean,
    public is_action?: boolean,
    public start_time?: number,
    public end_time?: number,
    public start_date?: number,
    public end_date?: number,
    public color?: LogColor
  ) {
    if(!this.id)this.id = -1;
    if(!this.category_id)this.category_id = 0;
    if(!this.title)this.title = '';
    if(!this.note)this.note = '';
    if(!this.is_timed) this.is_timed = false;
    if(!this.is_action)this.is_action = false;
    var now = new Date(Date.now());
    if(!this.start_time)this.start_time =  (now.getHours() * 100) +  now.getMinutes() ;
    if(!this.end_time)this.end_time = (now.getHours() * 100) +  now.getMinutes() ;
    if(!this.start_date)this.start_date = (now.getFullYear() * 10000) + (now.getMonth() * 100) + now.getDate();
    if(!this.end_date)this.end_date = (now.getFullYear() * 10000) + (now.getMonth() * 100) + now.getDate();
    if(!this.color)this.color = LogColor.pink;
  }

}

export interface LAA {
  log_id: number;
  action_id?: number;
  action_subject_id?: number;
  details?: string;
}

export enum LogColor {
  purple = "purple-log",
  red = "red-log",
  blue = "blue-log",
  lightblue = "light-blue-log",
  green = "green-log",
  darkgreen = "dark-green-log",
  white = "white-log",
  orange = "orange-log",
  yellow = "yellow-log",
  bluegray = "blue-gray-log",
  pink = "pink-log",
}


export function numAsDate(id:number) :Date{
  var y = Math.floor(id / 10000);
  var m = (Math.floor((id / 100)))%100;
  var d = id % 100;
  return new Date(y, m - 1, d);
}
