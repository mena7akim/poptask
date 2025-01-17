const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "FAILED",
        result: {
          message: "Internal Server Error",
        },
      });
    });
  };
};

const globalErrorHandling = (error, req, res, next) => {
  return res.status(error.cause || 400).json({
    status: "FAILED",
    result: {
      message: error.message,
    },
  });
};

module.exports = { asyncHandler, globalErrorHandling };
