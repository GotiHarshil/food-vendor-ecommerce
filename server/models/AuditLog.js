const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actorId:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorEmail:   String,
  action:       { type: String, required: true },
  resourceType: String,
  resourceId:   String,
  meta:         mongoose.Schema.Types.Mixed,
  ip:           String,
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);
