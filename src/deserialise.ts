import { Match, SerialisedMatch, Season, SerialisedSeason } from '@vcalendars/models';

export function deserialiseMatch(sm: SerialisedMatch): Match {
  return {
    ...sm,
    time: new Date(sm.time),
  };
}

export function deserialiseSeason(ss: SerialisedSeason): Season {
  return {
    ...ss,
    matches: ss.matches.map(deserialiseMatch),
  };
}
