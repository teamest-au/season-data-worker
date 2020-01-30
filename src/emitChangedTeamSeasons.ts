import { flatMap } from 'rxjs/operators';

import Logger from '@danielemeryau/logger';
import { TeamSeason } from '@vcalendars/models';

async function emitTeamSeason(teamSeason: TeamSeason, logger: Logger) {
  logger.info(`Emitted ${JSON.stringify(teamSeason)}`);
  return Promise.resolve();
}

export default function emitChangedTeamSeasons(logger: Logger) {
  return flatMap(async (teamSeason: TeamSeason) => {
    await emitTeamSeason(teamSeason, logger);
    return teamSeason;
  });
}
