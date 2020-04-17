import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return createCategoriesTable()
    .then(createLogsTable)
    .then(createActionsTable)
    .then(createActionSubjectsTable)
    .then(CreateLaasTable)
    .then(CreateKeywordsTable)
    .then(createLogKeywordsTable)

  function removeForeignKeyChecks() {
    return knex.raw('SET foreign_key_checks = 0;');
  }

  function addForeignKeyChecks() {
    return knex.raw('SET foreign_key_checks = 1;');
  }

  function createCategoriesTable() {
    return knex.schema.createTable('categories', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable().index().unique();
      table.string('color').defaultTo('pink-log');
      table.string('description').nullable();
    });
  }
  function createLogsTable() {
    return knex.schema
      .createTable('logs', function (table) {
        table.increments('id').primary();
        table.integer('category_id').notNullable().defaultTo(0)
          .index().references('id').inTable('categories').onDelete('RESTRICT');
        table.string('title').nullable();
        table.string('note').nullable();
        table.string('color').defaultTo('pink-log');
        table.integer('start_date').notNullable().index();
        table.integer('end_date').nullable();
        table.integer('start_time').nullable();
        table.integer('end_time').nullable();
        table.boolean('is_action').defaultTo(false);
        table.boolean('is_timed').defaultTo(false);
      });
  }
  function createActionsTable() {
    return knex.schema.createTable('actions', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable().index().unique();
      table.string('type').notNullable();
      table.string('adverb').notNullable();
      table.string('color').defaultTo('pink-log');
      table.string('description').nullable();
    });
  }
  function createActionSubjectsTable() {
    return knex.schema.createTable('action_subjects', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable().index().unique();
      table.string('description').nullable();
    });
  }
  function CreateLaasTable() {
    return knex.schema.createTable('laas', function (table) {
      table.integer('log_id').primary().references('id').inTable('logs').onDelete('CASCADE');
      table.integer('action_id')
        .references('id').inTable('actions').nullable()
      table.integer('action_subject_id')
        .references('id').inTable('action_subjects').nullable()
      table.string('details').nullable();
      table.integer('data').nullable();
    });
  }
  function CreateKeywordsTable() {
    return knex.schema.createTable('keywords', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable().index().unique();
    });
  }
  function createLogKeywordsTable() {
    return knex.schema.createTable('log_keywords', function (table) {
      table.integer('log_id').notNullable()
        .references('id').inTable('logs').onDelete('CASCADE');
      table.integer('keyword_id').notNullable()
        .references('id').inTable('keywords').onDelete('CASCADE');
      table.primary(['log_id', 'keyword_id']);
    });
  }
}




exports.down = function async(knex: Knex): Promise<any> {
  return dropLogKeywords()
    .then(dropKeywords)
    .then(dropLaas)
    .then(dropactionSubjects)
    .then(dropActions)
    .then(dropCategories)
    .then(dropLogs);

  function dropTable(name: string) {
    return knex.schema.dropTable(name);
  }
  function dropLogKeywords() { return dropTable('log_keywords'); }
  function dropKeywords() { return dropTable('keywords'); }
  function dropLaas() { return dropTable('laas'); }
  function dropactionSubjects() { return dropTable('action_subjects'); }
  function dropActions() { return dropTable('actions'); }
  function dropCategories() { return dropTable('categories'); }
  function dropLogs() { return dropTable('logs'); }
}

