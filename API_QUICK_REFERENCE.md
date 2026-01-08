# API Endpoints Quick Reference

## Base URL
```
http://localhost:3000/api
```

---

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | ❌ | - | Register new user |
| POST | `/auth/login` | ❌ | - | Login (sends OTP) |
| POST | `/auth/verify-login` | ❌ | - | Verify OTP and get token |
| POST | `/auth/forgot-password` | ❌ | - | Request password reset OTP |
| POST | `/auth/verify-reset-otp` | ❌ | - | Verify reset OTP |
| POST | `/auth/reset-password` | ❌ | - | Reset password with token |
| GET | `/auth/profile` | ✅ | All | Get current user profile |
| PUT | `/auth/profile` | ✅ | All | Update current user profile |
| PUT | `/auth/change-password` | ✅ | All | Change password |

---

## User Endpoints (`/api/users`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users` | ✅ | ADMIN | Get all users (with filters) |
| GET | `/users/:id` | ✅ | ADMIN | Get user by ID |
| POST | `/users` | ✅ | ADMIN | Create new user |
| PUT | `/users/:id` | ✅ | ADMIN | Update user |
| DELETE | `/users/:id` | ✅ | ADMIN | Delete user |
| PUT | `/users/:id/reset-password` | ✅ | ADMIN | Reset user password |

---

## Department Endpoints (`/api/departments`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/departments` | ✅ | All | Get all departments |
| GET | `/departments/:id` | ✅ | All | Get department by ID |
| POST | `/departments` | ✅ | ADMIN | Create department |
| PUT | `/departments/:id` | ✅ | ADMIN | Update department |
| DELETE | `/departments/:id` | ✅ | ADMIN | Delete department |

---

## Request Endpoints (`/api/requests`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/requests` | ✅ | All | Create new request |
| GET | `/requests/my` | ✅ | All | Get my requests |
| GET | `/requests/department` | ✅ | MANAGER, ADMIN | Get department requests |
| GET | `/requests` | ✅ | MANAGER, ADMIN | Get all requests |
| GET | `/requests/:id` | ✅ | All | Get request by ID |
| PUT | `/requests/:id` | ✅ | All | Update request |
| DELETE | `/requests/:id` | ✅ | All | Delete request |
| POST | `/requests/:id/submit` | ✅ | All | Submit request |
| POST | `/requests/:id/cancel` | ✅ | All | Cancel request |

---

## Approval Endpoints (`/api/approvals`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/approvals/pending` | ✅ | MANAGER, ADMIN | Get pending approvals |
| POST | `/approvals/:requestId/approve` | ✅ | MANAGER, ADMIN | Approve request |
| POST | `/approvals/:requestId/reject` | ✅ | MANAGER, ADMIN | Reject request |
| GET | `/approvals/:requestId` | ✅ | All | Get approval history |

---

## Payment Endpoints (`/api/payments`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/payments/pending` | ✅ | ADMIN | Get pending payments |
| POST | `/payments/:requestId` | ✅ | ADMIN | Process payment |
| GET | `/payments` | ✅ | ADMIN | Get payment history |
| GET | `/payments/:id` | ✅ | ADMIN | Get payment by ID |

---

## Notification Endpoints (`/api/notifications`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/notifications` | ✅ | All | Get notifications |
| PUT | `/notifications/read-all` | ✅ | All | Mark all as read |
| PUT | `/notifications/:id/read` | ✅ | All | Mark notification as read |
| DELETE | `/notifications/:id` | ✅ | All | Delete notification |

---

## Total Endpoints: 44

- **Authentication**: 9 endpoints
- **Users**: 6 endpoints
- **Departments**: 5 endpoints
- **Requests**: 9 endpoints
- **Approvals**: 4 endpoints
- **Payments**: 4 endpoints
- **Notifications**: 4 endpoints

---

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filters
- **Users**: `role`, `isActive`, `department`
- **Requests**: `status`, `departmentId`
- **Payments**: `paymentMethod`, `startDate`, `endDate`
- **Notifications**: `isRead`

---

## Request Status Values

- `DRAFT` - Created but not submitted
- `SUBMITTED` - Awaiting manager approval
- `SEMI_APPROVED` - Manager approved, awaiting admin
- `APPROVED` - Fully approved, ready for payment
- `REJECTED` - Rejected
- `PAID` - Payment processed

---

## User Roles

- `EMPLOYEE` - Regular user
- `MANAGER` - Department manager
- `ADMIN` - System administrator

---

## Priority Levels

- `LOW`
- `MEDIUM`
- `HIGH`

---

## Notification Types

- `INFO`
- `WARNING`
- `ERROR`

---

## Authentication

Most endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

Get token from `/auth/verify-login` endpoint after OTP verification.
