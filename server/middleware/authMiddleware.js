const config = require('../config/config');

/**
 * Checks whether an incoming request contains valid administrative credentials.
 * Reads private ADMIN_API_KEY exclusively from the backend environment.
 */
const isAuthorizedAdmin = (req) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;

  const apiKeyHeader = req.headers['x-admin-key'] || req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7).trim()
      : null;

  const providedKey = apiKeyHeader || bearerToken;
  return Boolean(providedKey && providedKey === adminKey);
};

/**
 * Middleware to protect administrative batch listing and management in production.
 * - In local development: preserves full API access for development and local testing.
 * - In production: blocks public retrieval of the full manufacturing batch list.
 * - Only server-to-server operations presenting the private backend ADMIN_API_KEY are authorized in production.
 */
const requireAdminAuth = (req, res, next) => {
  const isProduction =
    config.nodeEnv === 'production' || process.env.NODE_ENV === 'production';

  // In local development, preserve full API functionality
  if (!isProduction) {
    return next();
  }

  // In production, allow authorized server-to-server operations with matching ADMIN_API_KEY
  if (isAuthorizedAdmin(req)) {
    return next();
  }

  // In production, block public administrative access
  return res.status(403).json({
    success: false,
    error: {
      message:
        'Access denied. Administrative manufacturing endpoints are restricted in production.',
    },
  });
};

/**
 * Middleware to protect write endpoints (POST, PATCH, PUT, DELETE).
 * - In local development: preserves full API functionality for development and local testing.
 * - In production: keeps public browser writes blocked until proper Supabase Auth JWT
 *   verification and role-based authorization (RBAC) are implemented.
 * - Only server-to-server operations presenting the private backend ADMIN_API_KEY are authorized in production.
 */
const requireWriteAuth = (req, res, next) => {
  const isProduction =
    config.nodeEnv === 'production' || process.env.NODE_ENV === 'production';

  // In local development, preserve full API functionality
  if (!isProduction) {
    return next();
  }

  // In production, allow authorized server-to-server operations with matching ADMIN_API_KEY
  if (isAuthorizedAdmin(req)) {
    return next();
  }

  // In production, block all public writes
  return res.status(403).json({
    success: false,
    error: {
      message:
        'Manufacturing write operations are disabled in production. Public client mutations are blocked until Supabase Auth JWT verification and role-based access control are implemented.',
    },
  });
};

module.exports = {
  requireAdminAuth,
  requireWriteAuth,
};
