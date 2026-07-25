function haystack(signal) {
  return [signal.title, signal.body, signal.sender, signal.source, signal.domain]
    .filter(Boolean).join(' ').toLocaleLowerCase('fr');
}

export function routeSignalByEditions(signal, editionIds, registry) {
  const text = haystack(signal);
  return editionIds
    .map(id => registry.get(id))
    .filter(Boolean)
    .map(profile => {
      const keywordHits = profile.keywords.filter(keyword => text.includes(keyword));
      const domainHit = profile.domains.includes(signal.domain);
      const criticalHit = (profile.criticalPatterns ?? []).find(pattern => text.includes(pattern));
      const score = keywordHits.length * 8 + (domainHit ? 20 : 0) + (criticalHit ? 35 : 0);
      return { editionId: profile.id, score, keywordHits, domainHit, criticalHit: criticalHit ?? null };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.editionId.localeCompare(b.editionId));
}
