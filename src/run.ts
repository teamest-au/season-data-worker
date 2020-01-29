import Logger from '@danielemeryau/logger';
import { Rabbit, observeRabbit } from '@danielemeryau/simple-rabbitmq';
import { Season } from '@vcalendars/models';

export default async function run(rabbit: Rabbit<Season>, logger: Logger) {
  return Promise.resolve(true);
}
