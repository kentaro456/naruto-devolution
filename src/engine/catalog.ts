import { ROSTER } from '../data/roster';
import { STAGES } from '../data/stages';

export async function loadGameCatalog(): Promise<{
  roster: typeof ROSTER;
  stages: typeof STAGES;
}> {
  return {
    roster: ROSTER,
    stages: STAGES,
  };
}
