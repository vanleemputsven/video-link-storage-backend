const errorHandler = (err, req, res, next) => {
    console.error("Fout:", err);
  
    res.status(err.status || 500).json({
      message: err.message || "Er is een interne serverfout opgetreden.",
      error: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };
  
  module.exports = errorHandler;
  