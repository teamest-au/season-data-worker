import { flatMap } from 'rxjs/operators';
import { OperatorFunction, Observable } from 'rxjs';

import { Season, TeamSeason } from '@vcalendars/models';
import Logger from '@danielemeryau/logger';

function extractTeamNames(season: Season): string[] {
  let teamNames = new Set<string>();
  season.matches.forEach(match => {
    teamNames.add(match.away.name);
    teamNames.add(match.home.name);
    if (match.duty) {
      teamNames.add(match.duty.name);
    }
  });
  return Array.from(teamNames);
}

export default function seasonToTeamSeasons(
  logger: Logger,
): OperatorFunction<Season, TeamSeason> {
  return flatMap((season: Season) => {
    logger.info('Processing season', { name: season.name });
    return new Observable<TeamSeason>(observer => {
      const teamNames = extractTeamNames(season);
      teamNames.forEach(teamName => {
        observer.next({
          seasonName: season.name,
          teamName,
          matches: season.matches
            .filter(
              match =>
                match.away.name === teamName ||
                match.home.name === teamName ||
                match.duty?.name === teamName,
            )
            .sort((a, b) => a.time.getTime() - b.time.getTime()),
        });
      });
      observer.complete();
    });
  });
}
