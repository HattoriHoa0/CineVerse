/**
 *
 * @param {object} res
 * @param {object | null} data
 * @param {number} [statusCode=200]
 */
const success = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    status: "success",
    data: data,
  });
};

/**
 *
 * @param {object} res
 * @param {object} data
 * @param {number} [statusCode=400]
 */
const fail = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    status: "fail",
    message: message,
  });
};

/**
 *
 * @param {object} res
 * @param {string} message
 * @param {number} [statusCode=500]
 */
const error = (res, message = "Internal Server Error", statusCode = 500) => {
  res.status(statusCode).json({
    status: "error",
    message: message,
  });
};

module.exports = {
  success,
  fail,
  error,
};
