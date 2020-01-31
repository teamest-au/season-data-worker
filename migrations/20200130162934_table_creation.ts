import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable('team_season', function(table) {
    table.increments();
    table.string('team_name');
    table.string('season_name');
    table.timestamps(false, true);
  });

  return knex.schema.createTable('team_season_matches', function(table) {
    table.increments();
    table.integer('team_season_id').unsigned();
    table.foreign('team_season_id').references('team_season.id');
    table.json('matches');
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable('team_season_matches');
  return knex.schema.dropTable('team_season');
}
