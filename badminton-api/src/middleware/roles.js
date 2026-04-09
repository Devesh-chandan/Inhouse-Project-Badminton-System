/**
 * Role-based access control helper.
 * Usage: router.get('/admin', auth(['admin']), handler)
 * This is already handled by the auth middleware, but this module
 * provides a standalone requireRole middleware for convenience.
 */

const auth = require('./auth');

/**
 * Middleware that restricts access to specific roles.
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => auth(roles.flat());

module.exports = requireRole;
