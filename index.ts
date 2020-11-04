import Logger from '@danielemeryau/logger';
import { Rabbit } from '@danielemeryau/simple-rabbitmq';

import { InternalSeasonServiceClient } from '@teamest/internal-season-client';

import run from './src/run';

const FIVE_MINUTES_MILLIS = 5 * 60 * 1000;
const TEN_SECONDS_MILLIS = 10 * 1000;

const logger = new Logger('season-data-worker');
const rabbitLogger = new Logger('season-data-worker/simple-rabbitmq');
let rabbit: Rabbit;
let seasonDataClient: InternalSeasonServiceClient;

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
  await rabbit.connect({
    retry: true,
    retryWait: TEN_SECONDS_MILLIS,
    timeoutMillis: FIVE_MINUTES_MILLIS,
  });

  const internalSeasonUrl =
    process.env.INTERNAL_SEASON_URL || 'http://localhost:9010';

  seasonDataClient = new InternalSeasonServiceClient(
    internalSeasonUrl,
    'season-data-worker/internal-season-client',
  );
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
