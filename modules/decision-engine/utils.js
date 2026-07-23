'use strict';

(function initUtils(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_UTILS = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory() {
  const STOP_WORDS = new Set([
    'the','and','for','with','from','your','you','this','that','are','was',
    'une','des','les','pour','avec','dans','sur','est','sont','vos','votre',
    'und','der','die','das','mit','für','von','una','las','los','para','con','del'
  ]);

  function clamp(value, min = 0, max = 100) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, number));
  }

  function round(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round(Number(value || 0) * factor) / factor;
  }

  function normalizeText(value = '') {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9@.\s_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function words(value = '') {
    return normalizeText(value)
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  }

  function similarity(leftValue, rightValue) {
    const left = new Set(words(leftValue));
    const right = new Set(words(rightValue));
    if (!left.size || !right.size) return 0;
    let common = 0;
    left.forEach((word) => {
      if (right.has(word)) common += 1;
    });
    return common / Math.max(left.size, right.size);
  }

  function toDate(value) {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function ageHours(value, now = new Date()) {
    const date = toDate(value);
    return date ? Math.max(0, (now.getTime() - date.getTime()) / 3600000) : 0;
  }

  function hoursUntil(value, now = new Date()) {
    const date = toDate(value);
    return date ? (date.getTime() - now.getTime()) / 3600000 : null;
  }

  function daysUntil(value, now = new Date()) {
    const hours = hoursUntil(value, now);
    return hours === null ? null : Math.ceil(hours / 24);
  }

  function includesAny(text, terms) {
    const value = normalizeText(text);
    return terms.some((term) => value.includes(normalizeText(term)));
  }

  function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function weightedAverage(entries, fallback = 0) {
    const valid = (entries || []).filter(
      (entry) => Number.isFinite(Number(entry.value)) && Number(entry.weight) > 0
    );
    if (!valid.length) return fallback;
    const totalWeight = valid.reduce((sum, entry) => sum + Number(entry.weight), 0);
    return valid.reduce(
      (sum, entry) => sum + Number(entry.value) * Number(entry.weight),
      0
    ) / totalWeight;
  }

  function safeId(value = '') {
    return normalizeText(value).replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
  }

  return {
    clamp,
    round,
    normalizeText,
    words,
    similarity,
    toDate,
    ageHours,
    hoursUntil,
    daysUntil,
    includesAny,
    unique,
    weightedAverage,
    safeId
  };
});
