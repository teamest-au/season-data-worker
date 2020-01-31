import Knex from 'knex';
import { TeamSeason, Match, SerialisedMatch } from '@vcalendars/models';
import Logger from '@danielemeryau/logger';
import deepEqual from 'fast-deep-equal';

import { deserialiseMatch } from './deserialise';

interface DBTeamSeasonMatches {
  matches: SerialisedMatch[];
}
interface DBTeamSeason {
  id: number;
}

export interface TeamSeasonUpdate {
  seasonName: string;
  teamName: string;
  id: number;
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
        .select<DBTeamSeason>('id')
        .from('team_season')
        .where({ season_name: receivedSeasonName, team_name: recievedTeamName })
        .first();

      if (existing) {
        this.logger.info(`Team season exists`, {
          id: existing.id,
          teamName: recievedTeamName,
          seasonName: receivedSeasonName,
        });
        const latestMatches = await trx
          .select<DBTeamSeasonMatches>('matches')
          .from('team_season_matches')
          .where({ team_season_id: existing.id })
          .orderBy('created_at', 'desc')
          .first();

        if (!latestMatches) {
          throw new Error(
            'team_season exists without any team_season_matches!',
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
          await trx('team_season_matches').insert({
            team_season_id: existing.id,
            matches: JSON.stringify(receivedMatches),
          });
          result = {
            id: existing.id,
            seasonName: receivedSeasonName,
            teamName: recievedTeamName,
          };
        }
      } else {
        this.logger.info(
          "Team season doesn't exist, inserting with latest matches",
          { teamName: recievedTeamName, seasonName: receivedSeasonName },
        );
        const teamSeasonId = await trx('team_season').insert(
          {
            season_name: receivedSeasonName,
            team_name: recievedTeamName,
          },
          'id',
        );
        await trx('team_season_matches').insert({
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
