// Import Zod để kiểm tra schema, jsend để trả response chuẩn, ApiError để xử lý lỗi server
const { z } = require("zod");
const jsend = require("../utils/jsend");
const ApiError = require("../api-error");

/**
 * Middleware validate dữ liệu đầu vào của request (params, query, body)
 * bằng schema được định nghĩa sẵn (dùng Zod).
 *
 * @param {z.AnyZodObject} validator - Schema kiểm tra dữ liệu yêu cầu
 * @returns {function} Middleware dùng trong router
 */
function validateRequest(validator) {
  return (req, res, next) => {
    try {
      // Bắt đầu với params (ví dụ :id trong /users/:id)
      let input = { ...req.params };

      // Nếu là GET hoặc DELETE → gộp thêm dữ liệu query (req.query)
      if (req.method === "GET" || req.method === "DELETE") {
        input = { ...input, ...req.query };
      }

      // Nếu là POST hoặc PUT → gộp thêm body (req.body)
      if (req.method === "POST" || req.method === "PUT") {
        input = {
          ...input,
          ...(req.body || {}),
        };
      }

      // Dữ liệu hợp lệ → tiếp tục xử lý tiếp theo (controller)
      validator.parse(input);
      return next();
    } catch (error) {
      // Nếu lỗi là từ Zod (schema validation thất bại)
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0]; // Chỉ lấy lỗi đầu tiên
        return jsend.fail(res, firstError.message, 400); // Gửi response kiểu jsend với lỗi cụ thể
      }

      // Nếu không phải lỗi từ Zod → trả lỗi 500 mặc định
      return next(new ApiError(500, "Internal Server Error from validator."));
    }
  };
}

module.exports = {
  validateRequest,
};
