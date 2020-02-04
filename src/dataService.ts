import Knex from 'knex';
import Logger from '@danielemeryau/logger';
import deepEqual from 'fast-deep-equal';
import uuidv4 from 'uuid/v4';

import { SerialisedMatch } from '@vcalendars/models/raw';
import { deserialiseMatch } from '@vcalendars/models/helpers';
import { TeamSeason } from '@vcalendars/models/processed';

interface DBTeamSeasonMatches {
  matches: SerialisedMatch[];
}
interface DBTeamSeason {
  team_season_id: number;
}

export interface TeamSeasonUpdate {
  seasonName: string;
  teamName: string;
  team_season_id: number;
}

export default class DataService {
  private knex: Knex;
  private logger: Logger;

  constructor(knex: Knex, logger: Logger) {
    this.knex = knex;
    this.logger = logger;
  }

  async updateTeamSeasonIfChanged(
    ts: TeamSeason,
  ): Promise<TeamSeasonUpdate | undefined> {
    let result: TeamSeasonUpdate | undefined = undefined;
    const {
      seasonName: receivedSeasonName,
      teamName: recievedTeamName,
      matches: receivedMatches,
    } = ts;

    const trx = await this.knex.transaction();
    try {
      const existing = await trx
        .select<DBTeamSeason>('team_season_id')
        .from('team_season')
        .where({ season_name: receivedSeasonName, team_name: recievedTeamName })
        .first();

      if (existing) {
        this.logger.info(`Team season exists`, {
          id: existing.team_season_id,
          teamName: recievedTeamName,
          seasonName: receivedSeasonName,
        });
        const latestMatches = await trx
          .select<DBTeamSeasonMatches>('matches')
          .from('team_season_match')
          .where({ team_season_id: existing.team_season_id })
          .orderBy('created_at', 'desc')
          .first();

        if (!latestMatches) {
          throw new Error(
            'team_season exists without any team_season_match entries!',
          );
        }

        const deserialisedLatestMatches = latestMatches.matches.map(
          deserialiseMatch,
        );

        this.logger.debug('Diffing existing matches against recieved', {
          deserialisedLatestMatches,
          receivedMatches,
        });
        if (deepEqual(deserialisedLatestMatches, receivedMatches)) {
          this.logger.info('Matches are unchanged.', {
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          });
        } else {
          this.logger.info('Matches have changed changed, updating.', {
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          });
          await trx('team_season_match').insert({
            team_season_match_id: uuidv4(),
            team_season_id: existing.team_season_id,
            matches: JSON.stringify(receivedMatches),
          });
          result = {
            team_season_id: existing.team_season_id,
            seasonName: receivedSeasonName,
            teamName: recievedTeamName,
          };
        }
      } else {
        this.logger.info(
          "Team season doesn't exist, inserting with latest matches",
          { teamName: recievedTeamName, seasonName: receivedSeasonName },
        );
        const teamSeasonId = uuidv4();
        await trx('team_season').insert({
          team_season_id: teamSeasonId,
          season_name: receivedSeasonName,
          team_name: recievedTeamName,
        });
        await trx('team_season_match').insert({
          team_season_match_id: uuidv4(),
          team_season_id: teamSeasonId,
          matches: JSON.stringify(receivedMatches),
        });
      }

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }

    return result;
  }

  async destroy() {
    await this.knex.destroy();
  }
}
