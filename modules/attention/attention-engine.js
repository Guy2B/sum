'use strict';

const LEVEL = { info: 1, normal: 2, important: 3, urgent: 4, critical: 5 };

class AttentionEngine {
  constructor({ cooldownMinutes = 60, maxPerGroup = 3 } = {}) {
    this.cooldownMinutes = cooldownMinutes;
    this.maxPerGroup = maxPerGroup;
  }

  prioritize(items, { now = new Date(), preferences = {} } = {}) {
    const groups = new Map();
    for (const item of items) {
      if (preferences.mutedTypes?.includes(item.type)) continue;
      if (item.snoozedUntil && new Date(item.snoozedUntil) > now) continue;
      const key = item.groupKey || item.type || 'general';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const output = [];
    for (const [groupKey, groupItems] of groups) {
      const selected = groupItems
        .filter(item => !item.lastDeliveredAt || (now - new Date(item.lastDeliveredAt)) / 60000 >= this.cooldownMinutes || LEVEL[item.level || 'normal'] >= LEVEL.urgent)
        .sort((a, b) => LEVEL[b.level || 'normal'] - LEVEL[a.level || 'normal'] || new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
        .slice(0, this.maxPerGroup);
      if (selected.length) output.push({ groupKey, highestLevel: selected[0].level || 'normal', items: selected });
    }
    return output.sort((a, b) => LEVEL[b.highestLevel] - LEVEL[a.highestLevel] || a.groupKey.localeCompare(b.groupKey));
  }
}

module.exports = { AttentionEngine };
