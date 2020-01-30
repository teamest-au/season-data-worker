import { map } from 'rxjs/operators';
import Logger from '@danielemeryau/logger';
import { Rabbit, observeRabbit } from '@danielemeryau/simple-rabbitmq';
import {
  Season,
  SerialisedSeason,
  Match,
  SerialisedMatch,
} from '@vcalendars/models';

import seasonToTeamSeasons from './seasonToTeamSeasons';
import processTeamSeason from './processTeamSeason';
import emitChangedTeamSeasons from './emitChangedTeamSeasons';

function deserialiseMatch(sm: SerialisedMatch): Match {
  return {
    ...sm,
    time: new Date(sm.time),
  };
}

function deserialiseSeason(ss: SerialisedSeason): Season {
  return {
    ...ss,
    matches: ss.matches.map(deserialiseMatch),
  };
}

export default async function run(
  rabbit: Rabbit<SerialisedSeason>,
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
        processTeamSeason(logger),
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
