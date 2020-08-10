import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import Logger from '@danielemeryau/logger';

import { Season, Match, Duty, Event } from '@teamest/models/raw';
import { ScrapedSeasonMessage } from '@teamest/models/messages';
import { TeamSeason } from '@teamest/models/processed';
import { EventGuards } from '@teamest/models/helpers';

function extractTeamNames(season: Season): string[] {
  let teamNames = new Set<string>();
  season.events.forEach((event) => {
    if (event.type === 'match' || event.type === 'duty') {
      const match = (event as unknown) as Match | Duty;
      const { home, away, duty } = match;
      if (home && !home.isExternal) {
        teamNames.add(home.name);
      }
      if (away && !away.isExternal) {
        teamNames.add(away.name);
      }
      if (duty && !duty.isExternal) {
        teamNames.add(duty.name);
      }
    }
  });
  return Array.from(teamNames);
}

function isEventRelatedToTeam(event: Event, teamName: string) {
  if (EventGuards.isDuty(event)) {
    return [event.away?.name, event.home?.name, event.duty.name].includes(
      teamName,
    );
  }
  if (EventGuards.isMatch(event)) {
    return [event.away.name, event.home.name, event.duty?.name].includes(
      teamName,
    );
  }
  return false;
}

export default function seasonToTeamSeasons(
  scrapedSeasonMessage: ScrapedSeasonMessage,
  logger: Logger,
): TeamSeason[] {
  const { season, timeScraped } = scrapedSeasonMessage;
  logger.info('Processing season', {
    competitionName: season.competitionName,
    seasonName: season.seasonName,
  });

  const teamNames = extractTeamNames(season);

  return teamNames.map((teamName) => ({
    competitionName: season.competitionName,
    seasonName: season.seasonName,
    teamName,
    lastScraped: timeScraped,
    events: season.events
      .filter((event) => isEventRelatedToTeam(event, teamName))
      .sort((a, b) => a.time.getTime() - b.time.getTime()),
  }));
}
