import { map } from 'rxjs/operators';
import Logger from '@danielemeryau/logger';
import {
  Rabbit,
  observeRabbit,
  publishObservable,
} from '@danielemeryau/simple-rabbitmq';
import { SerialisedSeason } from '@vcalendars/models';

import seasonToTeamSeasons from './seasonToTeamSeasons';
import processTeamSeason from './processTeamSeason';
import DataService, { TeamSeasonUpdate } from './dataService';
import { deserialiseSeason } from './deserialise';

export default async function run(
  rabbit: Rabbit,
  data: DataService,
  logger: Logger,
) {
  const { observable } = await observeRabbit<SerialisedSeason>(
    rabbit,
    <string>process.env.RABBIT_MQ_READ_EXCHANGE,
    undefined,
    <string>process.env.RABBIT_MQ_READ_QUEUE,
  );
  await observable
    .pipe(
      map(deserialiseSeason),
      seasonToTeamSeasons(logger),
      processTeamSeason(logger, data),
      publishObservable<TeamSeasonUpdate>(
        rabbit,
        <string>process.env.RABBIT_MQ_WRITE_EXCHANGE,
      ),
    )
    .toPromise();
}
