import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import Logger from '@danielemeryau/logger';
import { TeamSeason } from '@vcalendars/models';

async function updateSeasonIfChanged(): Promise<boolean> {
  return Promise.resolve(true);
}

export default function processTeamSeason(logger: Logger) {
  return flatMap((teamSeason: TeamSeason) => {
    return new Observable<TeamSeason>(observer => {
      updateSeasonIfChanged()
        .then(changed => {
          if (changed) {
            observer.next(teamSeason);
          }
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
          observer.complete();
        });
    });
  });
}
