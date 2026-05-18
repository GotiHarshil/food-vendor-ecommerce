// Resource ownership middleware factory
// Usage: requireOwns(Order, "userId") returns middleware that:
//   1. Fetches document by req.params.id
//   2. Checks doc[ownerField] matches req.user._id (or admin bypass)
//   3. Passes fetched doc in req.resource

function requireOwns(Model, ownerField = "userId") {
  return async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Not found" });
      }

      if (req.user.role === "admin") {
        req.resource = doc;
        return next();
      }

      if (String(doc[ownerField]) !== String(req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      req.resource = doc;
      next();
    } catch (err) {
      res.status(500).json({ error: "Server error: " + err.message });
    }
  };
}

module.exports = { requireOwns };
