import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import Logger from '@danielemeryau/logger';

import { Season } from '@vcalendars/models/raw';
import { ScrapedSeasonMessage } from '@vcalendars/models/messages';
import { TeamSeason } from '@vcalendars/models/processed';

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
  scrapedSeasonMessage: ScrapedSeasonMessage,
  logger: Logger,
): TeamSeason[] {
  const { season, timeScraped, timezone, matchDuration } = scrapedSeasonMessage;
  logger.info('Processing season', { name: season.name });

  const teamNames = extractTeamNames(season);

  return teamNames.map(teamName => ({
    seasonName: season.name,
    teamName,
    timeScraped,
    timezone,
    matchDuration,
    matches: season.matches
      .filter(
        match =>
          match.away.name === teamName ||
          match.home.name === teamName ||
          match.duty?.name === teamName,
      )
      .sort((a, b) => a.time.getTime() - b.time.getTime()),
  }));
}
