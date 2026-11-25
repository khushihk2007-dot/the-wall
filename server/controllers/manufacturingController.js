const manufacturingService = require('../services/manufacturingService');

/**
 * Manufacturing Controller - Handles HTTP requests for manufacturing batches
 */

/**
 * GET /api/manufacturing/batches
 * Retrieves all manufacturing batches formatted for the frontend.
 */
const getBatches = async (req, res, next) => {
  try {
    const batches = await manufacturingService.getAllBatches();
    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/manufacturing/batches/:batchId
 * Retrieves a single manufacturing batch by its business batch code.
 */
const getBatchById = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    if (!batchId || typeof batchId !== 'string' || !batchId.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or missing batch ID parameter.',
        },
      });
    }

    const trimmedBatchId = batchId.trim();
    const batch = await manufacturingService.getBatchByBatchId(trimmedBatchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Manufacturing batch '${trimmedBatchId}' not found.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/manufacturing/batches
 * Validates request payload and creates a new manufacturing batch in Supabase.
 */
const createBatch = async (req, res, next) => {
  try {
    const { quantity, cottonKg, coirKg, mediumKg, binder, startDate, notes } = req.body;

    // 1. Validate quantity (positive integer)
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Quantity must be a positive integer greater than 0.',
        },
      });
    }

    // 2. Validate material weights
    const parsedCotton = Number(cottonKg);
    if (isNaN(parsedCotton) || parsedCotton <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cotton quantity (cottonKg) must be a positive number greater than 0.',
        },
      });
    }

    const parsedCoir = Number(coirKg);
    if (isNaN(parsedCoir) || parsedCoir <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Coconut coir quantity (coirKg) must be a positive number greater than 0.',
        },
      });
    }

    const parsedMedium = Number(mediumKg);
    if (isNaN(parsedMedium) || parsedMedium <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Growing medium quantity (mediumKg) must be a positive number greater than 0.',
        },
      });
    }

    // 3. Validate startDate if supplied
    let formattedStartDate = null;
    if (startDate) {
      const parsedDate = new Date(startDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid production start date (startDate). Expected a valid date string (e.g. YYYY-MM-DD).',
          },
        });
      }
      formattedStartDate = parsedDate.toISOString().split('T')[0];
    } else {
      formattedStartDate = new Date().toISOString().split('T')[0];
    }

    // 4. Sanitize text fields
    const sanitizedBinder = typeof binder === 'string' ? binder.trim() : null;
    const sanitizedNotes = typeof notes === 'string' ? notes.trim() : null;

    // 5. Invoke service
    const createdBatch = await manufacturingService.createBatch({
      quantity: parsedQuantity,
      cottonKg: parsedCotton,
      coirKg: parsedCoir,
      mediumKg: parsedMedium,
      binder: sanitizedBinder,
      startDate: formattedStartDate,
      notes: sanitizedNotes,
    });

    return res.status(201).json({
      success: true,
      batch: createdBatch,
      data: createdBatch,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * PATCH /api/manufacturing/batches/:batchId/stage
 * Advances a batch to the next sequential manufacturing stage.
 */
const advanceBatchStage = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const { note } = req.body || {};

    if (!batchId || typeof batchId !== 'string' || !batchId.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or missing batch ID parameter.',
        },
      });
    }

    const trimmedBatchId = batchId.trim();
    const sanitizedNote = typeof note === 'string' && note.trim().length > 0 ? note.trim() : null;

    const updatedBatch = await manufacturingService.advanceBatchStage(trimmedBatchId, sanitizedNote);

    return res.status(200).json({
      success: true,
      batch: updatedBatch,
      data: updatedBatch,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  advanceBatchStage,
};
