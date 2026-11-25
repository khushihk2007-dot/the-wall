const { getSupabase, isSupabaseConfigured } = require('../config/supabase');

/**
 * Health & Root Controller - The Wall Backend
 */

const getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'The Wall Backend is running.',
    timestamp: new Date().toISOString(),
  });
};

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'The Wall Backend',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    version: '1.0.0',
  });
};

/**
 * GET /api/health/database
 * Verifies backend communication with Supabase without requiring any app tables to exist.
 * Never exposes credentials or sensitive database connection strings.
 */
const getDatabaseHealth = async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      status: 'unconfigured',
      server: 'The Wall Backend',
      database: 'Supabase',
      connected: false,
      message: 'Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const supabase = getSupabase();
    const startTime = Date.now();

    // Verify network communication and service role authorization with Supabase
    // auth.admin.listUsers verifies service role access without requiring any application schema tables
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const latencyMs = Date.now() - startTime;

    if (error) {
      return res.status(502).json({
        status: 'error',
        server: 'The Wall Backend',
        database: 'Supabase',
        connected: false,
        message: 'Failed to communicate with Supabase project. Check project URL and service role key.',
        error: error.message || 'Authentication or network communication error',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'connected',
      server: 'The Wall Backend',
      database: 'Supabase',
      connected: true,
      latency: `${latencyMs}ms`,
      message: 'Supabase database communication verified successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      server: 'The Wall Backend',
      database: 'Supabase',
      connected: false,
      message: err.message || 'Unexpected database health check failure',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  getRoot,
  getHealth,
  getDatabaseHealth,
};
