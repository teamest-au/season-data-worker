import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import Logger from '@danielemeryau/logger';
import { InternalSeasonClient } from '@teamest/internal-season-client';

import { ITeamSeasonEnvelope } from './season-to-team-season-envelopes';

export interface IProcessedTeamSeasonEnvelope extends ITeamSeasonEnvelope {
  changed: boolean;
}

export default function processTeamSeasonEnvelope(
  logger: Logger,
  data: InternalSeasonClient,
) {
  return flatMap(async (teamSeasonEnvelope: ITeamSeasonEnvelope) => {
    const { teamSeason } = teamSeasonEnvelope;
    const result = await data.updateTeamSeason(teamSeason);
    return <IProcessedTeamSeasonEnvelope>{
      ...teamSeasonEnvelope,
      changed: result !== undefined,
    };
  });
}
