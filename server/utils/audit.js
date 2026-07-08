const AuditLog = require("../models/AuditLog");

function logAudit(req, action, resourceType, resourceId, meta = {}) {
  AuditLog.create({
    actorId:    req.user?._id,
    actorEmail: req.user?.email,
    action,
    resourceType,
    resourceId:  String(resourceId),
    meta,
    ip: req.ip,
  }).catch((err) => console.error("Audit log error:", err));
}

// For system-originated events with no authenticated req (e.g. Stripe webhooks).
function logAuditSystem(action, resourceType, resourceId, meta = {}, actor = {}) {
  AuditLog.create({
    actorId: actor.actorId,
    actorEmail: actor.actorEmail || "system:stripe-webhook",
    action,
    resourceType,
    resourceId: String(resourceId),
    meta,
    ip: null,
  }).catch((err) => console.error("Audit log error:", err));
}

module.exports = { logAudit, logAuditSystem };
