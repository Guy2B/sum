const REQUIRED_EDITIONS = ['creator', 'frontier-worker', 'freelancer', 'small-business', 'family', 'caregiver', 'job-seeker', 'student'];

export function editionSignalAcceptanceGate({ profiles = [], scenarios = [] }) {
  const ids = new Set(profiles.map(profile => profile.id));
  const missingEditions = REQUIRED_EDITIONS.filter(id => !ids.has(id));
  const invalidScenarios = scenarios.filter(scenario => !scenario?.signal?.id || !scenario?.action?.title || !scenario?.signal?.priorityLevel);
  return { ok: missingEditions.length === 0 && invalidScenarios.length === 0, missingEditions, invalidScenarios };
}
