import { LogDate } from './log.date';
export { };
declare global {
  interface Number {
    toTime(): { hour: number, minute: number };
  }

}
// declare module './log.date' {
//   interface LogDate {
//     gee(): number;
//   }
// }
//LogDate.prototype.gee = function (): number { return 999999999999999999; };

Number.prototype.toTime = function (): { hour: number, minute: number } { return { hour: 0, minute: 0 }; };

