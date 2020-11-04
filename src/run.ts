import { flatMap, filter, map } from 'rxjs/operators';
import Logger from '@danielemeryau/logger';
import {
  Rabbit,
  observeRabbit,
  publishObservable,
} from '@danielemeryau/simple-rabbitmq';

import { InternalSeasonServiceClient } from '@teamest/internal-season-client';
import {
  SerialisedScrapedSeasonMessage,
  ChangedSeasonMessage,
} from '@teamest/models/messages';
import { MessageSerialisers } from '@teamest/models/helpers';

import processTeamSeasonEnvelope, {
  IProcessedTeamSeasonEnvelope,
} from './process-team-season-envelope';
import createMessage from './createMessage';
import seasonToTeamSeasonEnvelopes from './season-to-team-season-envelopes';

export default async function run(
  rabbit: Rabbit,
  data: InternalSeasonServiceClient,
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
      flatMap((envelope) => {
        const deserialised = {
          ...envelope,
          message: MessageSerialisers.deserialiseScrapedSeasonMessage(
            envelope.message,
          ),
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
      map((teamSeasonEnvelope) => teamSeasonEnvelope.teamSeason),
      createMessage(),
      publishObservable<ChangedSeasonMessage>(
        rabbit,
        <string>process.env.RABBIT_MQ_WRITE_EXCHANGE,
      ),
    )
    .toPromise();
}
