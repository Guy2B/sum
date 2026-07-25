'use strict';
const ROLES = Object.freeze({ owner:4, admin:3, member:2, child:1, guest:0 });
class WorkspaceHouseholdEngine {
  constructor() { this.workspaces = new Map(); }
  create({ id, type='personal', ownerId, parentId=null }) { if (!id || !ownerId) throw new TypeError('id and ownerId are required'); if (this.workspaces.has(id)) throw new Error(`workspace exists: ${id}`); const ws={id,type,ownerId,parentId,members:new Map([[ownerId,'owner']])}; this.workspaces.set(id,ws); return this.snapshot(ws); }
  addMember(workspaceId, userId, role='member') { const ws=this.require(workspaceId); if (!(role in ROLES)) throw new RangeError(`unknown role: ${role}`); ws.members.set(userId,role); return this.snapshot(ws); }
  can(workspaceId,userId,requiredRole='member') { const ws=this.require(workspaceId); const role=ws.members.get(userId); return role !== undefined && ROLES[role] >= ROLES[requiredRole]; }
  effectiveRole(workspaceId,userId) { let ws=this.require(workspaceId); while (ws) { if (ws.members.has(userId)) return ws.members.get(userId); ws=ws.parentId ? this.workspaces.get(ws.parentId) : null; } return null; }
  require(id){const ws=this.workspaces.get(id);if(!ws)throw new Error(`unknown workspace: ${id}`);return ws;}
  snapshot(ws){return {id:ws.id,type:ws.type,ownerId:ws.ownerId,parentId:ws.parentId,members:Object.fromEntries(ws.members)};}
}
module.exports = { WorkspaceHouseholdEngine, ROLES };
