import { map } from 'rxjs/operators';
import Logger from '@danielemeryau/logger';
import {
  Rabbit,
  observeRabbit,
  publishObservable,
} from '@danielemeryau/simple-rabbitmq';

import {
  SerialisedScrapedSeasonMessage,
  ChangedSeasonMessage,
} from '@vcalendars/models/messages';
import { deserialiseScrapedSeasonMessage } from '@vcalendars/models/helpers';

import seasonToTeamSeasons from './seasonToTeamSeasons';
import processTeamSeason from './processTeamSeason';
import DataService from './dataService';
import createMessage from './createMessage';

export default async function run(
  rabbit: Rabbit,
  data: DataService,
  logger: Logger,
) {
  const { observable } = await observeRabbit<SerialisedScrapedSeasonMessage>(
    rabbit,
    <string>process.env.RABBIT_MQ_READ_EXCHANGE,
    undefined,
    <string>process.env.RABBIT_MQ_READ_QUEUE,
  );
  await observable
    .pipe(
      map(deserialiseScrapedSeasonMessage),
      seasonToTeamSeasons(logger),
      processTeamSeason(logger, data),
      createMessage(),
      publishObservable<ChangedSeasonMessage>(
        rabbit,
        <string>process.env.RABBIT_MQ_WRITE_EXCHANGE,
      ),
    )
    .toPromise();
}
