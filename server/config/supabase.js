const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabaseClient = null;

/**
 * Returns an initialized Supabase admin client using the service role key.
 * Validates that required environment variables exist.
 */
const getSupabase = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = config.supabaseUrl;
  const supabaseServiceRoleKey = config.supabaseServiceRoleKey;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

    throw new Error(
      `Missing required Supabase configuration: ${missing.join(', ')}. Please configure them in server/.env`
    );
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    throw new Error(`Failed to initialize Supabase client: ${err.message}`);
  }
};

/**
 * Utility to check if Supabase credentials are configured.
 */
const isSupabaseConfigured = () => {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
};

module.exports = {
  getSupabase,
  isSupabaseConfigured,
};
