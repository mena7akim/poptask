const successResponse = (res, result, code) => {
  return res.status(code || 200).json({
    status: "OK",
    result,
  });
};

module.exports = { successResponse };
