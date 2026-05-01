# Chào Account — API Reference

## Auth APIs

### POST `/api/auth/register`
Đăng ký tài khoản mới.

**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)",
  "gender": "male | female | other",
  "dateOfBirth": "YYYY-MM-DD"
}
```

### POST `/api/auth/otp`
Gửi mã OTP xác minh email.

**Body:**
```json
{ "email": "string", "type": "email" }
```

### PUT `/api/auth/otp`
Xác minh mã OTP.

**Body:**
```json
{ "email": "string", "otp": "string (6 digits)" }
```

### POST `/api/auth/reset-password/request`
Yêu cầu reset password — gửi OTP.

**Body:**
```json
{ "email": "string" }
```

### POST `/api/auth/reset-password/change`
Đổi mật khẩu mới.

**Body:**
```json
{ "email": "string", "password": "string", "otp": "string" }
```

---

## Account APIs (yêu cầu đăng nhập)

### GET `/api/account/profile`
Lấy thông tin hồ sơ user hiện tại.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "gender": "string | null",
    "dateOfBirth": "string | null",
    "image": "string | null",
    "createdAt": "string",
    "emailVerified": "string | null"
  }
}
```

### PUT `/api/account/profile`
Cập nhật hồ sơ.

**Body:**
```json
{
  "name": "string",
  "phone": "string",
  "gender": "male | female | other",
  "dateOfBirth": "YYYY-MM-DD"
}
```

### POST `/api/account/security/change-password`
Đổi mật khẩu.

**Body:**
```json
{ "currentPassword": "string", "newPassword": "string" }
```

### GET `/api/account/security/audit-logs`
Lấy 20 hoạt động bảo mật gần nhất.

### GET `/api/account/notifications`
Lấy danh sách thông báo (max 50).

### PUT `/api/account/notifications`
Đánh dấu đã đọc.

**Body:**
```json
{ "markAllRead": true }
// hoặc
{ "notificationId": "uuid" }
```

### GET `/api/me`
Lấy thông tin user hiện tại (từ session).

### GET `/api/health`
Health check endpoint.
