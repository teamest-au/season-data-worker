import { map } from 'rxjs/operators';
import { ChangedSeasonMessage } from '@vcalendars/models/messages';
import { TeamSeasonUpdate } from './dataService';

const MESSAGE_VERSION = 'v1.0';

export default function createMessage() {
  return map<TeamSeasonUpdate, ChangedSeasonMessage>(
    ({ seasonName, teamName }) => ({
      seasonName,
      teamName,
      timeDetected: new Date(),
      version: MESSAGE_VERSION,
    }),
  );
}
