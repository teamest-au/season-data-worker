import { map } from 'rxjs/operators';
import { ChangedSeasonMessage } from '@teamest/models/messages';
import { TeamSeason } from '@teamest/models/processed';

const MESSAGE_VERSION = 'v1.0';

export default function createMessage() {
  return map<TeamSeason, ChangedSeasonMessage>(({ competitionName, seasonName, teamName }) => ({
    competitionName,
    seasonName,
    teamName,
    timeDetected: new Date(),
    version: MESSAGE_VERSION,
  }));
}
