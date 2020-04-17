import * as Knex from "knex";


export async function seed(knex: Knex): Promise<any> {
  const create = new createThings();
  // Deletes ALL existing entries
  return knex('categories').insert(create.sttctgs)
    .then(createactions)
    .then(createactionSubjects)
    .then(createLogs)
    .then(createLaas);

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

};

class createThings {
  ctgs;
  sttLogs;
  sttActs;
  sttActSubs;
  sttLAAs;
  sttctgs = [
    { id: 0, name: "ctg0", description: "ctgdescription0", color: LogColor.blue },
    { id: 1, name: "ctg1", description: "ctgdescription1", color: LogColor.green },
    { id: 2, name: "ctg2", description: "ctgdescription2", color: LogColor.purple },
    { id: 3, name: "ctg3", description: "ctgdescription3", color: LogColor.yellow },
    { id: 4, name: "ctg4", description: "ctgdescription4", color: LogColor.darkgreen },
    { id: 5, name: "ctg5", description: "ctgdescription5", color: LogColor.white, },
    { id: 6, name: "ctg6", description: "ctgdescription6", color: LogColor.bluegray },
    { id: 7, name: "ctg7", description: "ctgdescription7", color: LogColor.red },
  ];

  constructor() {
    this.ctgs = this.sttctgs;
    this.sttLogs = this.createLogs();
    this.sttActs = this.createActions();
    this.sttActSubs = this.createActionSubjects();
    this.sttLAAs = this.createLAAs();
  }

  createLogs() {
    const enumvals = Object.values<LogColor>(LogColor);
    const arr = new Array(10000).fill(null).map((v, i) => {
      const d = 20000000 + ((Math.floor(Math.random() * 20) + 1) * 10000) + ((Math.floor(Math.random() * 12) + 1) * 100) + Math.floor(Math.random() * 31) + 1;
      const t = { hours: Math.floor(Math.random() * 22), minutes: Math.floor(Math.random() * 60) };
      const t2 = Object.assign({}, t, { hours: t.hours + 1 });
      return {
        id: i,
        category_id: Math.floor(Math.random() * this.ctgs.length),//this.ctgs[Math.floor()]
        start_date: d,
        end_date: d,
        start_time: t,
        end_time: t2,
        color: enumvals[Math.floor(Math.random() * enumvals.length)],
        title: `Logasfdsfsadfgafgasdfsadfasdfasdfasdfsadfadf${i}`,
        note: `Note${i}`
      }
    }
    );
    return arr;
  }

  createActions() {
    const enumvals = Object.values<LogColor>(LogColor);
    const enumvals2 = Object.values<ActionType>(ActionType);
    const arr = new Array(1000).fill(null).map((v, i) => {
      return {
        id: i, name: `action${i}`, type: enumvals2[Math.floor(Math.random() * enumvals2.length)],
        description: `actiondescription${i}`, color: enumvals[Math.floor(Math.random() * enumvals.length)]
        , adverb: `actadv${i}`,

      }
    });
    return arr;
  }
  createActionSubjects() {
    const arr = new Array(1000).fill(null).map((v, i) => {
      return {
        id: i, name: `actionSubject${i}`,
        description: `actionSubjectdescription${i}`
      }
    });
    return arr;
  }
  createLAAs() {
    const arr = new Array(10000).fill(null).map((v, i) => {
      return {
        log_id: i,
        action_id: Math.floor(Math.random() * 1000),
        action_subject_id: Math.floor(Math.random() * 1000),
        details: `actionDetails${i}`, data: Math.floor(Math.random() * 100 + 1)
      }
    });
    new Array(5000).fill(null).forEach(
      (v, i) => {
        const id = Math.floor(Math.random() * 10000);
        if (!this.sttLogs[id].is_action) {
          const la = arr.find(l => l.log_id === id);
          const an = this.sttActs[la.action_id].name;
          const ad = this.sttActs[la.action_id].adverb;
          const acs = this.sttActSubs[la.action_subject_id].name;
          const d = la.details;
          this.sttLogs[id].is_action = true;
          this.sttLogs[id].title = `${an} ${acs} ${ad} ${d}`;
        }
      }
    );
    return arr;
  }
}
enum LogColor {
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

enum ActionType {
  None = "None",
  Count = "Count",
  Sum = "Sum",
  String = "String"
}
