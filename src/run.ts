import { map } from 'rxjs/operators';
import Logger from '@danielemeryau/logger';
import { Rabbit, observeRabbit } from '@danielemeryau/simple-rabbitmq';
import { SerialisedSeason } from '@vcalendars/models';

import seasonToTeamSeasons from './seasonToTeamSeasons';
import processTeamSeason from './processTeamSeason';
import emitChangedTeamSeasons from './emitChangedTeamSeasons';
import DataService from './dataService';
import { deserialiseSeason } from './deserialise';

export default async function run(
  rabbit: Rabbit<SerialisedSeason>,
  data: DataService,
  logger: Logger,
) {
  return new Promise((resolve, reject) => {
    observeRabbit<SerialisedSeason>(
      rabbit,
      <string>process.env.RABBIT_MQ_READ_EXCHANGE,
    )
      .pipe(
        map(deserialiseSeason),
        seasonToTeamSeasons(logger),
        processTeamSeason(logger, data),
        emitChangedTeamSeasons(logger),
      )
      .subscribe(
        () => {},
        err => {
          logger.error(err);
          reject(err);
        },
        () => {
          resolve();
        },
      );
  });
}
