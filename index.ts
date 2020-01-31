import Knex from 'knex';
import Logger from '@danielemeryau/logger';
import { Rabbit } from '@danielemeryau/simple-rabbitmq';
import { SerialisedSeason, TeamSeason } from '@vcalendars/models';

import run from './src/run';
import DataService from './src/dataService';

const logger = new Logger('season-data-worker');
const rabbitLogger = new Logger('season-data-worker/simple-rabbitmq');
let rabbit: Rabbit<SerialisedSeason>;
let dataService: DataService;

async function initialise() {
  rabbit = new Rabbit<SerialisedSeason>(
    {
      host: process.env.RABBIT_MQ_HOST || 'localhost',
      port: process.env.RABBIT_MQ_PORT || '5672',
      user: process.env.RABBIT_MQ_USER || 'scraper',
      password: process.env.RABBIT_MQ_PASS || 'scraper',
    },
    rabbitLogger,
  );
  await rabbit.connect();

  const knex = Knex({
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'dataworker',
      password: process.env.MYSQL_PASS || 'dataworker',
      database: process.env.MYSQL_DATABASE || 'season_data',
    },
    migrations: {
      tableName: 'migrations',
    },
  });

  dataService = new DataService(knex, logger);
}

async function tearDown() {
  await rabbit.disconnect();
  await dataService.destroy();
}

logger.info('Season Data Worker Starting');
initialise()
  .then(() => {
    run(rabbit, dataService, logger)
      .then(async () => {
        await tearDown();
        logger.info('Season Data Worker Exited');
        process.exit(0);
      })
      .catch(async (err: any) => {
        logger.error('Error while running', err);
        await tearDown();
        process.exit(2);
      });
  })
  .catch(async (err: any) => {
    logger.error('Error while initialising', err);
    await tearDown();
    process.exit(1);
  });
