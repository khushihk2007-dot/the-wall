const traceabilityService = require('../services/traceabilityService');

/**
 * GET /api/traceability/:traceabilityId
 * Public endpoint to retrieve a single verified Digital Product Passport.
 * Returns 404 if the passport does not exist.
 */
const getPublicPassport = async (req, res, next) => {
  try {
    const { traceabilityId } = req.params;

    if (!traceabilityId || !traceabilityId.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Traceability identifier is required.' },
      });
    }

    const passport = await traceabilityService.getPublicPassport(traceabilityId);

    if (!passport) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Traceability record not found for ID: ${traceabilityId}`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      passport,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicPassport,
};
