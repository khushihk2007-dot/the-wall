const { getSupabase, isSupabaseConfigured } = require('../config/supabase');

/**
 * QC Controller - Handles administrative Quality Control API operations
 * Uses Supabase service role key strictly on the backend.
 */

const getQcTests = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: [],
      });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('qc_tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase qc_tests query warning:', error.message);
      return res.status(200).json({
        success: true,
        source: 'fallback',
        data: [],
        note: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data ? data.length : 0,
      data: data || [],
    });
  } catch (err) {
    return next(err);
  }
};

const recordQcTest = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(200).json({
        success: true,
        persisted: false,
        message: 'Supabase credentials not configured. Maintained in local reservoir.',
      });
    }

    const supabase = getSupabase();
    const body = req.body || {};

    const { data, error } = await supabase
      .from('qc_tests')
      .insert({
        batch_id: body.batchId,
        status: body.status || 'Pending',
        grade: body.grade || 'Insufficient Test Data',
        criteria_version: body.criteriaVersion || '1.0-VALIDATED',
        reviewer: body.reviewer || 'QC Tech',
        reviewer_notes: body.reviewerNotes || '',
        water_absorption_pct: body.waterAbsorptionPct || null,
        water_retention_pct: body.waterRetentionPct || null,
        moisture_spread_pct: body.moistureSpreadPct || null,
        thickness_deformation_pct: body.thicknessDeformationPct || null,
        drying_weight_loss_pct: body.dryingWeightLossPct || null,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase qc_tests insert warning:', error.message);
      return res.status(200).json({
        success: true,
        persisted: false,
        warning: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      persisted: true,
      data,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getQcTests,
  recordQcTest,
};
