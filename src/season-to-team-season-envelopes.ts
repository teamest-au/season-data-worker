import seasonToTeamSeasons from './seasonToTeamSeasons';
import Logger from '@danielemeryau/logger';
import { IEnvelope } from '@danielemeryau/simple-rabbitmq';
import { ScrapedSeasonMessage } from '@teamest/models/messages';
import { TeamSeason } from '@teamest/models/processed';

export interface ITeamSeasonEnvelope {
  teamSeason: TeamSeason;
  acknowledge: () => void;
}

export default function seasonEnvelopeToTeamSeasonEnvelopes(
  envelope: IEnvelope<ScrapedSeasonMessage>,
  logger: Logger,
): ITeamSeasonEnvelope[] {
  let count = 0;
  const teamSeasons = seasonToTeamSeasons(envelope.message, logger);
  const acknowledge = () => {
    count += 1;
    const { message } = envelope;
    const { season } = message;
    logger.debug(
      `Count for ${season.competitionName} ${season.seasonName} at ${count}/${teamSeasons.length}`,
    );
    if (count >= teamSeasons.length) {
      if (envelope.acknowledge) {
        envelope.acknowledge();
      }
    }
  };
  return teamSeasons.map((teamSeason) => ({
    teamSeason,
    acknowledge,
  }));
}
