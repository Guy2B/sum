const REQUIRED = ['id', 'domains', 'keywords', 'priorityBoosts'];

export class EditionSignalProfileRegistry {
  constructor(profiles = []) {
    this.profiles = new Map();
    profiles.forEach(profile => this.register(profile));
  }

  register(profile) {
    for (const key of REQUIRED) {
      if (profile?.[key] == null) throw new TypeError(`Missing profile field: ${key}`);
    }
    const normalized = Object.freeze({
      ...profile,
      domains: [...new Set(profile.domains)],
      keywords: [...new Set(profile.keywords.map(value => String(value).toLowerCase()))],
      priorityBoosts: { ...profile.priorityBoosts }
    });
    this.profiles.set(normalized.id, normalized);
    return normalized;
  }

  get(id) { return this.profiles.get(id) ?? null; }
  list() { return [...this.profiles.values()]; }
}
