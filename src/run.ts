import { flatMap, filter, map } from 'rxjs/operators';
import Logger from '@danielemeryau/logger';
import {
  Rabbit,
  observeRabbit,
  publishObservable,
} from '@danielemeryau/simple-rabbitmq';

import {
  SerialisedScrapedSeasonMessage,
  ChangedSeasonMessage,
} from '@vcalendars/models/messages';
import { deserialiseScrapedSeasonMessage } from '@vcalendars/models/helpers';

import processTeamSeasonEnvelope, {
  IProcessedTeamSeasonEnvelope,
} from './process-team-season-envelope';
import DataService from './dataService';
import createMessage from './createMessage';
import seasonToTeamSeasonEnvelopes from './season-to-team-season-envelopes';

export default async function run(
  rabbit: Rabbit,
  data: DataService,
  logger: Logger,
) {
  const { observable } = await observeRabbit<SerialisedScrapedSeasonMessage>(
    rabbit,
    <string>process.env.RABBIT_MQ_READ_EXCHANGE,
    {
      queue: <string>process.env.RABBIT_MQ_READ_QUEUE,
    },
  );
  await observable
    .pipe(
      flatMap(envelope => {
        const deserialised = {
          ...envelope,
          message: deserialiseScrapedSeasonMessage(envelope.message),
        };
        const transformed = seasonToTeamSeasonEnvelopes(deserialised, logger);
        return transformed;
      }),
      processTeamSeasonEnvelope(logger, data),
      flatMap(async (envelope: IProcessedTeamSeasonEnvelope) => {
        await envelope.acknowledge();
        return envelope;
      }),
      filter((processed: IProcessedTeamSeasonEnvelope) => processed.changed),
      map(teamSeasonEnvelope => teamSeasonEnvelope.teamSeason),
      createMessage(),
      publishObservable<ChangedSeasonMessage>(
        rabbit,
        <string>process.env.RABBIT_MQ_WRITE_EXCHANGE,
      ),
    )
    .toPromise();
}
