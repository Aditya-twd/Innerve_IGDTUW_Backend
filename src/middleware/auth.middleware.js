// Placeholder auth middleware.
// Real authentication/authorization (JWT, session, etc.) can be plugged in later.

async function requireAdmin(req, res, next) {
  // For now, no-op: all requests pass through.
  // Admin-specific security can be implemented once the auth model is finalized.
  return next();
}

module.exports = {
  requireAdmin,
};

