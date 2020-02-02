import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import Logger from '@danielemeryau/logger';
import { TeamSeason } from '@vcalendars/models/processed';

import DataService, { TeamSeasonUpdate } from './dataService';

export default function processTeamSeason(logger: Logger, data: DataService) {
  return flatMap((teamSeason: TeamSeason) => {
    return new Observable<TeamSeasonUpdate>(observer => {
      data
        .updateTeamSeasonIfChanged(teamSeason)
        .then(teamSeasonUpdate => {
          if (teamSeasonUpdate) {
            observer.next(teamSeasonUpdate);
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
