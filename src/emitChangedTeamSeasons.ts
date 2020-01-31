import { flatMap } from 'rxjs/operators';

import Logger from '@danielemeryau/logger';
import { TeamSeasonUpdate } from './dataService';

async function emitTeamSeason(
  teamSeasonUpdate: TeamSeasonUpdate,
  logger: Logger,
) {
  logger.info(`Emitted ${JSON.stringify(teamSeasonUpdate)}`);
  return Promise.resolve();
}

export default function emitChangedTeamSeasons(logger: Logger) {
  return flatMap(async (teamSeasonUpdate: TeamSeasonUpdate) => {
    await emitTeamSeason(teamSeasonUpdate, logger);
    return teamSeasonUpdate;
  });
}
