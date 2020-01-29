import Logger from '@danielemeryau/logger';
import { Rabbit, observeRabbit } from '@danielemeryau/simple-rabbitmq';
import { Season } from '@vcalendars/models';

import run from './src/run';

const logger = new Logger('season-data-worker');
const rabbitLogger = new Logger('season-data-worker/simple-rabbitmq');
let rabbit: Rabbit<Season>;

async function initialise() {
  rabbit = new Rabbit<Season>(
    {
      host: process.env.RABBIT_MQ_HOST || 'localhost',
      port: process.env.RABBIT_MQ_PORT || '5672',
      user: process.env.RABBIT_MQ_USER || 'scraper',
      password: process.env.RABBIT_MQ_PASS || 'scraper',
    },
    rabbitLogger,
  );
  await rabbit.connect();
}

logger.info('Season Data Worker Starting');
initialise()
  .then(() => {
    run(rabbit, logger)
      .then(async () => {
        await rabbit.disconnect();
        logger.info('Season Data Worker Exited');
        process.exit(0);
      })
      .catch((err: any) => {
        logger.error('Error while running', err);
        rabbit.disconnect();
        process.exit(2);
      });
  })
  .catch((err: any) => {
    logger.error('Error while initialising', err);
    rabbit.disconnect();
    process.exit(1);
  });
