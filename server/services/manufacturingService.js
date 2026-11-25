const { getSupabase } = require('../config/supabase');

/**
 * Sequential production stages in exact order of progression.
 */
const MANUFACTURING_STAGES = [
  'Raw Material Preparation',
  'Mixing and Layering',
  'Compression and Forming',
  'Drying and Curing',
  'Quality Testing',
  'Completed',
];

/**
 * Transforms a raw Supabase manufacturing_batches row and its stage history
 * into the camelCase data structure expected by the frontend.
 */
const formatBatchResponse = (batch, historyRows = []) => {
  return {
    id: batch.batch_id,
    createdAt: batch.created_at,
    expectedCompletion: batch.expected_completion,
    quantity: batch.quantity,
    stage: batch.stage,
    status: batch.status,
    materials: {
      cottonKg: Number(batch.cotton_kg) || 0,
      coirKg: Number(batch.coir_kg) || 0,
      mediumKg: Number(batch.growing_medium_kg) || 0,
      binder: batch.binder_spec || '',
    },
    notes: batch.notes || '',
    history: historyRows.map((h) => ({
      stage: h.stage,
      timestamp: h.recorded_at,
      note: h.note || '',
    })),
  };
};

/**
 * Manufacturing Service - Supabase Database Operations
 */
const manufacturingService = {
  /**
   * Returns the list of standard manufacturing stages.
   */
  getStages() {
    return MANUFACTURING_STAGES;
  },

  /**
   * Calculates a valid next sequential batch ID in the format TW-YYYY-BXXX (e.g. TW-2026-B001).
   * Queries existing records for the given year to determine the highest suffix.
   */
  async generateNextBatchId(startDate) {
    const supabase = getSupabase();
    let year;
    if (startDate) {
      const parsed = new Date(startDate);
      year = !isNaN(parsed.getFullYear()) ? parsed.getFullYear() : new Date().getFullYear();
    } else {
      year = new Date().getFullYear();
    }

    const prefix = `TW-${year}-B`;

    const { data, error } = await supabase
      .from('manufacturing_batches')
      .select('batch_id')
      .ilike('batch_id', `${prefix}%`);

    if (error) {
      const err = new Error(`Database error querying existing batch IDs: ${error.message}`);
      err.statusCode = 502;
      throw err;
    }

    let maxSeq = 0;
    if (data && data.length > 0) {
      for (const row of data) {
        const match = row.batch_id.match(new RegExp(`^TW-${year}-B([0-9]{3})$`));
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    }

    const nextSeq = maxSeq + 1;
    if (nextSeq > 999) {
      const err = new Error(`Maximum batch sequence capacity (999) reached for year ${year}.`);
      err.statusCode = 409;
      throw err;
    }

    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
  },

  /**
   * Fetches all manufacturing batches and associates each with its stage history.
   */
  async getAllBatches() {
    const supabase = getSupabase();

    // 1. Fetch all batches ordered by creation date descending
    const { data: batches, error: batchError } = await supabase
      .from('manufacturing_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (batchError) {
      const err = new Error(`Database error fetching batches: ${batchError.message}`);
      err.statusCode = 502;
      throw err;
    }

    if (!batches || batches.length === 0) {
      return [];
    }

    // 2. Fetch all stage histories ordered chronologically
    const { data: histories, error: historyError } = await supabase
      .from('batch_stage_history')
      .select('*')
      .order('recorded_at', { ascending: true });

    if (historyError) {
      const err = new Error(`Database error fetching stage history: ${historyError.message}`);
      err.statusCode = 502;
      throw err;
    }

    // 3. Group history entries by batch UUID (batch_id in batch_stage_history references manufacturing_batches.id)
    const historyMap = new Map();
    if (histories) {
      for (const h of histories) {
        if (!historyMap.has(h.batch_id)) {
          historyMap.set(h.batch_id, []);
        }
        historyMap.get(h.batch_id).push(h);
      }
    }

    // 4. Map each batch into the camelCase frontend structure
    return batches.map((batch) => {
      const batchHistories = historyMap.get(batch.id) || [];
      return formatBatchResponse(batch, batchHistories);
    });
  },

  /**
   * Fetches a single manufacturing batch by its business batch ID (e.g. 'TW-2026-B001').
   * Returns null if not found.
   */
  async getBatchByBatchId(batchId) {
    const supabase = getSupabase();

    // 1. Fetch the batch by its unique business code (batch_id)
    const { data: batch, error: batchError } = await supabase
      .from('manufacturing_batches')
      .select('*')
      .eq('batch_id', batchId)
      .maybeSingle();

    if (batchError) {
      const err = new Error(`Database error fetching batch '${batchId}': ${batchError.message}`);
      err.statusCode = 502;
      throw err;
    }

    if (!batch) {
      return null;
    }

    // 2. Fetch corresponding stage history using the batch's primary key UUID
    const { data: historyRows, error: historyError } = await supabase
      .from('batch_stage_history')
      .select('*')
      .eq('batch_id', batch.id)
      .order('recorded_at', { ascending: true });

    if (historyError) {
      const err = new Error(`Database error fetching stage history for batch '${batchId}': ${historyError.message}`);
      err.statusCode = 502;
      throw err;
    }

    return formatBatchResponse(batch, historyRows || []);
  },

  /**
   * Creates a new manufacturing batch and its initial stage history entry.
   * Handles unique batch_id concurrency conflicts with retries.
   * Performs cleanup if initial stage history creation fails.
   */
  async createBatch({ quantity, cottonKg, coirKg, mediumKg, binder, startDate, notes }) {
    const supabase = getSupabase();

    // Standard 6-day manufacturing cycle
    const start = startDate || new Date().toISOString().split('T')[0];
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    const expectedCompletion = d.toISOString().split('T')[0];

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      attempts += 1;
      const batchId = await this.generateNextBatchId(start);

      // 1. Insert into manufacturing_batches
      const { data: newBatch, error: batchError } = await supabase
        .from('manufacturing_batches')
        .insert({
          batch_id: batchId,
          created_at: start,
          expected_completion: expectedCompletion,
          quantity,
          stage: 'Raw Material Preparation',
          status: 'In Progress',
          cotton_kg: cottonKg,
          coir_kg: coirKg,
          growing_medium_kg: mediumKg,
          binder_spec: binder || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (batchError) {
        // Concurrency retry on unique violation (code 23505)
        if (batchError.code === '23505' && attempts < maxAttempts) {
          lastError = batchError;
          continue;
        }
        const err = new Error(`Failed to create manufacturing batch: ${batchError.message}`);
        err.statusCode = batchError.code === '23505' ? 409 : 502;
        throw err;
      }

      // 2. Insert initial stage history entry
      const initialNote = 'Batch initialized and queued for raw material preparation.';
      const { data: historyRow, error: historyError } = await supabase
        .from('batch_stage_history')
        .insert({
          batch_id: newBatch.id,
          stage: 'Raw Material Preparation',
          note: initialNote,
        })
        .select()
        .single();

      if (historyError) {
        // Safe rollback / cleanup: delete orphaned batch if history creation fails
        await supabase
          .from('manufacturing_batches')
          .delete()
          .eq('id', newBatch.id);

        const err = new Error(`Failed to create initial stage history: ${historyError.message}`);
        err.statusCode = 502;
        throw err;
      }

      return formatBatchResponse(newBatch, [historyRow]);
    }

    const err = new Error(`Failed to generate unique batch ID after ${maxAttempts} attempts: ${lastError?.message}`);
    err.statusCode = 409;
    throw err;
  },

  /**
   * Advances a manufacturing batch to the next production stage in strict sequential order.
   * Enforces transition rules, optimistic concurrency checking, and compensating rollback.
   */
  async advanceBatchStage(batchId, customNote) {
    const supabase = getSupabase();

    // 1. Fetch current batch directly from the database to validate current stage and status
    const { data: currentBatch, error: fetchError } = await supabase
      .from('manufacturing_batches')
      .select('*')
      .eq('batch_id', batchId)
      .maybeSingle();

    if (fetchError) {
      const err = new Error(`Database error fetching batch '${batchId}': ${fetchError.message}`);
      err.statusCode = 502;
      throw err;
    }

    if (!currentBatch) {
      const err = new Error(`Manufacturing batch '${batchId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Validate batch status: On Hold and Cancelled batches cannot advance
    if (currentBatch.status === 'On Hold') {
      const err = new Error(`Cannot advance batch '${batchId}' because it is currently On Hold.`);
      err.statusCode = 400;
      throw err;
    }

    if (currentBatch.status === 'Cancelled') {
      const err = new Error(`Cannot advance batch '${batchId}' because it has been Cancelled.`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Validate stage bounds: Completed batches cannot advance
    if (currentBatch.stage === 'Completed' || currentBatch.status === 'Completed') {
      const err = new Error(`Batch '${batchId}' has already reached the final stage (Completed) and cannot advance further.`);
      err.statusCode = 400;
      throw err;
    }

    // 4. Determine current stage index and next valid stage
    const currentStageIndex = MANUFACTURING_STAGES.indexOf(currentBatch.stage);
    if (currentStageIndex === -1) {
      const err = new Error(`Batch '${batchId}' has an unrecognized stage '${currentBatch.stage}'.`);
      err.statusCode = 400;
      throw err;
    }

    if (currentStageIndex >= MANUFACTURING_STAGES.length - 1) {
      const err = new Error(`Batch '${batchId}' has already reached the final stage (Completed).`);
      err.statusCode = 400;
      throw err;
    }

    const nextStage = MANUFACTURING_STAGES[currentStageIndex + 1];
    const isCompleted = nextStage === 'Completed';
    const newStatus = isCompleted ? 'Completed' : currentBatch.status; // 'In Progress'

    // 5. Update batch stage and status using optimistic concurrency check (eq('stage', currentBatch.stage))
    // This guarantees that a concurrent request cannot advance the batch twice or skip stages.
    const { data: updatedBatch, error: updateError } = await supabase
      .from('manufacturing_batches')
      .update({
        stage: nextStage,
        status: newStatus,
      })
      .eq('id', currentBatch.id)
      .eq('stage', currentBatch.stage)
      .select()
      .maybeSingle();

    if (updateError) {
      const err = new Error(`Database error advancing batch '${batchId}': ${updateError.message}`);
      err.statusCode = 502;
      throw err;
    }

    if (!updatedBatch) {
      const err = new Error(`Conflict advancing batch '${batchId}'. The stage was modified by another operation. Please refresh and retry.`);
      err.statusCode = 409;
      throw err;
    }

    // 6. Record stage transition entry in batch_stage_history
    const stageNote =
      customNote ||
      (isCompleted
        ? 'Final manufacturing stage verified. Ready for QA release and QR generation.'
        : `Transitioned successfully to ${nextStage}.`);

    const { error: historyError } = await supabase
      .from('batch_stage_history')
      .insert({
        batch_id: updatedBatch.id,
        stage: nextStage,
        note: stageNote,
      });

    if (historyError) {
      // Compensating transaction: rollback batch stage and status if history record insertion fails
      await supabase
        .from('manufacturing_batches')
        .update({
          stage: currentBatch.stage,
          status: currentBatch.status,
        })
        .eq('id', updatedBatch.id);

      const err = new Error(`Failed to record stage transition history for batch '${batchId}': ${historyError.message}`);
      err.statusCode = 502;
      throw err;
    }

    // 7. Fetch complete chronological stage history for the response
    const { data: allHistory, error: historyFetchError } = await supabase
      .from('batch_stage_history')
      .select('*')
      .eq('batch_id', updatedBatch.id)
      .order('recorded_at', { ascending: true });

    if (historyFetchError) {
      const err = new Error(`Failed to fetch updated stage history for batch '${batchId}': ${historyFetchError.message}`);
      err.statusCode = 502;
      throw err;
    }

    return formatBatchResponse(updatedBatch, allHistory || []);
  },
};

module.exports = manufacturingService;
