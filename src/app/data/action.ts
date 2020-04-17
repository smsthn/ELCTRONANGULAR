import { LogColor } from "./log.data";



export interface Action{
  id:number;
  name:string;
  description?: string;
  type: ActionType;
  color?:LogColor;
  adverb?:string;
}


export enum ActionType{
  None = "None",
  Count = "Count",
  Sum = "Sum",
  String ="String"
}
