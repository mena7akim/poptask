const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.error(error);
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
  console.error(error);
  return res.status(error.cause || 400).json({
    status: "FAILED",
    result: {
      message: error.message,
    },
  });
};

const unauthorizedError = (
  message = "You are not authorized to perform this action."
) => {
  return new Error(message, { cause: 401 });
};

module.exports = { asyncHandler, globalErrorHandling, unauthorizedError };
