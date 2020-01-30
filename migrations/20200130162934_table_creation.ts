import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('team_season', function(table) {
    table.increments();
    table.string('team_name');
    table.string('season_name');
    table.timestamps();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('team_season');
}
