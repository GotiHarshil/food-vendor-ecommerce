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

module.exports = { logAudit };
