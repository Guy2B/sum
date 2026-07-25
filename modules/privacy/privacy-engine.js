'use strict';

const LEVELS = Object.freeze({ public: 0, internal: 1, private: 2, sensitive: 3, restricted: 4 });

function createPolicy(input = {}) {
  if (!input.workspaceId) throw new TypeError('workspaceId is required');
  return { workspaceId: String(input.workspaceId), domain: input.domain || '*', minimumRole: input.minimumRole || 'member', maximumPrivacyLevel: input.maximumPrivacyLevel || 'private', allowedPurposes: Array.isArray(input.allowedPurposes) ? [...input.allowedPurposes] : ['operate'], retentionDays: Number.isFinite(Number(input.retentionDays)) ? Math.max(0, Number(input.retentionDays)) : 365, memoryAllowed: input.memoryAllowed !== false, exportAllowed: input.exportAllowed !== false };
}

function authorize(context = {}, resource = {}, action = 'read', policyInput = {}) {
  const policy = createPolicy({ workspaceId: context.workspaceId, ...policyInput });
  const reasons = [];
  if (!context.userId) reasons.push('unauthenticated');
  if (!context.workspaceId || context.workspaceId !== resource.workspaceId) reasons.push('workspace mismatch');
  if (resource.owner && resource.owner !== context.userId && !['owner', 'admin'].includes(context.role)) reasons.push('not owner or administrator');
  if ((LEVELS[resource.privacyLevel] ?? LEVELS.private) > (LEVELS[policy.maximumPrivacyLevel] ?? LEVELS.private)) reasons.push('privacy level exceeds policy');
  if (context.purpose && !policy.allowedPurposes.includes(context.purpose)) reasons.push('purpose not allowed');
  if (action === 'remember' && !policy.memoryAllowed) reasons.push('memory disabled');
  if (action === 'export' && !policy.exportAllowed) reasons.push('export disabled');
  if (['write', 'delete', 'share'].includes(action) && !['owner', 'admin', 'editor'].includes(context.role)) reasons.push('insufficient role');
  return { allowed: reasons.length === 0, reasons, action, policy };
}

function retentionState(resource = {}, policyInput = {}, now = Date.now()) {
  const policy = createPolicy({ workspaceId: resource.workspaceId, ...policyInput });
  const createdAt = Date.parse(resource.createdAt || '');
  if (!Number.isFinite(createdAt) || policy.retentionDays === 0) return { expired: policy.retentionDays === 0, expiresAt: policy.retentionDays === 0 ? resource.createdAt || null : null };
  const expiresAt = createdAt + policy.retentionDays * 86400000;
  return { expired: now >= expiresAt, expiresAt: new Date(expiresAt).toISOString() };
}

function redact(resource = {}, fields = []) {
  const clone = JSON.parse(JSON.stringify(resource));
  for (const field of fields) {
    if (Object.hasOwn(clone, field)) clone[field] = '[REDACTED]';
  }
  return clone;
}

module.exports = { LEVELS, createPolicy, authorize, retentionState, redact };
