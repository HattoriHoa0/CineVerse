// Import thư viện Zod để xây dựng schema kiểm tra đầu vào
const { z } = require("zod");

/**
 * Schema kiểm tra dữ liệu cho yêu cầu đăng ký người dùng.
 * Đảm bảo username, email và password hợp lệ trước khi tạo tài khoản.
 */
const registerSchema = z.object({
  // Tên người dùng: bắt buộc, ít nhất 3 ký tự
  username: z
    .string({
      required_error: "Tên người dùng là bắt buộc.", // Nếu thiếu trường này
    })
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự."), // Nếu quá ngắn

  // Email: bắt buộc, đúng định dạng
  email: z
    .string({
      required_error: "Email là bắt buộc.",
    })
    .email("Email không hợp lệ."),

  // Mật khẩu: bắt buộc, ít nhất 6 ký tự
  password: z
    .string({
      required_error: "Mật khẩu là bắt buộc.",
    })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

/**
 * Schema kiểm tra dữ liệu cho yêu cầu đăng nhập.
 * Chỉ cần email và mật khẩu hợp lệ.
 */
const loginSchema = z.object({
  // Email: bắt buộc, đúng định dạng
  email: z
    .string({
      required_error: "Email là bắt buộc.",
    })
    .email("Email không hợp lệ."),

  // Mật khẩu: bắt buộc (không yêu cầu độ dài ở đây)
  password: z.string({
    required_error: "Mật khẩu là bắt buộc.",
  }),
});

// Xuất schema để sử dụng trong middleware validator
module.exports = {
  registerSchema,
  loginSchema,
};
