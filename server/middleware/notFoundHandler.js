/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
};

module.exports = notFoundHandler;
