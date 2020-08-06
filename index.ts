import Logger from '@danielemeryau/logger';
import { Rabbit } from '@danielemeryau/simple-rabbitmq';
import { InternalSeasonClient } from '@teamest/internal-season-client';

import run from './src/run';

const logger = new Logger('season-data-worker');
const rabbitLogger = new Logger('season-data-worker/simple-rabbitmq');
let rabbit: Rabbit;
let seasonDataClient: InternalSeasonClient;

async function initialise() {
  rabbit = new Rabbit(
    {
      host: process.env.RABBIT_MQ_HOST || 'localhost',
      port: process.env.RABBIT_MQ_PORT || '5672',
      user: process.env.RABBIT_MQ_USER || 'scraper',
      password: process.env.RABBIT_MQ_PASS || 'scraper',
    },
    rabbitLogger,
  );
  await rabbit.connect();

  const grpcHost = process.env.INTERNAL_SEASON_HOST || 'localhost';
  const grpcPort = process.env.INTERNAL_SEASON_PORT || 50051;

  seasonDataClient = new InternalSeasonClient(`${grpcHost}:${grpcPort}`);
}

async function tearDown() {
  await rabbit.disconnect();
}

logger.info('Season Data Worker Starting');
initialise()
  .then(() => {
    run(rabbit, seasonDataClient, logger)
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
