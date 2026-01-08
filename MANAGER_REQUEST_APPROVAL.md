# Manager Request Auto-Approval Feature

## Overview

Implemented a special approval workflow for requests created by managers. Manager requests automatically skip the manager approval step and go directly to admin approval.

## Business Rule

**When a MANAGER creates a request:**
- The request is automatically set to `SEMI_APPROVED` status (instead of `SUBMITTED`)
- Only ADMIN can approve these requests
- Other managers cannot approve requests from managers

**When an EMPLOYEE creates a request:**
- The request starts with `SUBMITTED` status
- Requires manager approval first → `SEMI_APPROVED`
- Then requires admin approval → `APPROVED`

---

## Implementation Details

### 1. Request Creation Logic

**File**: `src/services/request.service.ts`

```typescript
// Auto-determine initial status based on requester role
const initialStatus = data.userRole === 'MANAGER' 
    ? RequestStatus.SEMI_APPROVED  // Skip manager approval
    : RequestStatus.SUBMITTED;      // Normal flow
```

**Controller**: `src/controllers/request.controller.ts`
- Passes `req.user.role` to the service

---

### 2. Approval Validation

**File**: `src/services/approval.service.ts`

**Prevents managers from approving manager requests:**
```typescript
if (request.user?.role === 'MANAGER') {
    return {
        allowed: false,
        message: 'Manager requests require admin approval. You cannot approve requests from other managers.'
    };
}
```

---

### 3. Pending Approvals Filtering

**File**: `src/services/approval.service.ts`

**Managers see:**
- Only `SUBMITTED` requests (employee requests)
- Excludes requests created by other managers

**Admins see:**
- All `SEMI_APPROVED` requests
- Includes both:
  - Employee requests approved by manager
  - Manager requests (auto-approved to SEMI_APPROVED)

---

## Approval Flow Diagrams

### Employee Request Flow
```
EMPLOYEE creates request
        ↓
    SUBMITTED
        ↓
MANAGER approves
        ↓
  SEMI_APPROVED
        ↓
 ADMIN approves
        ↓
    APPROVED
        ↓
 ADMIN processes payment
        ↓
      PAID
```

### Manager Request Flow
```
MANAGER creates request
        ↓
  SEMI_APPROVED (auto)
        ↓
 ADMIN approves
        ↓
    APPROVED
        ↓
 ADMIN processes payment
        ↓
      PAID
```

---

## Benefits

✅ **Faster approval for managers** - Skips one approval step
✅ **Prevents conflicts** - Managers can't approve each other's requests
✅ **Clear separation** - Admin has final say on manager requests
✅ **Maintains oversight** - Admin still approves all manager requests

---

## API Behavior

### Creating a Request

**Endpoint**: `POST /api/requests`

**Employee Request:**
```json
{
  "title": "New Laptop",
  "resourceName": "Dell XPS",
  ...
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "status": "SUBMITTED"  // Needs manager approval
    }
  }
}
```

**Manager Request:**
```json
{
  "title": "New Laptop",
  "resourceName": "Dell XPS",
  ...
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "status": "SEMI_APPROVED"  // Goes directly to admin
    }
  }
}
```

---

### Pending Approvals

**Endpoint**: `GET /api/approvals/pending`

**Manager sees:**
- Only employee requests with `SUBMITTED` status
- Manager requests are filtered out

**Admin sees:**
- All `SEMI_APPROVED` requests
- Includes both employee and manager requests

---

### Attempting to Approve Manager Request as Manager

**Endpoint**: `POST /api/approvals/:requestId/approve`

**Response:**
```json
{
  "success": false,
  "message": "Manager requests require admin approval. You cannot approve requests from other managers."
}
```

---

## Testing

### Test Scenario 1: Manager Creates Request
1. Login as manager
2. Create a request
3. Verify status is `SEMI_APPROVED`
4. Check pending approvals - should NOT appear in manager's list
5. Login as admin
6. Check pending approvals - should appear in admin's list

### Test Scenario 2: Manager Tries to Approve Manager Request
1. Login as manager A
2. Create a request (status: SEMI_APPROVED)
3. Login as manager B
4. Try to approve manager A's request
5. Should receive error message

### Test Scenario 3: Employee Request Flow
1. Login as employee
2. Create a request (status: SUBMITTED)
3. Login as manager
4. See request in pending approvals
5. Approve request (status: SEMI_APPROVED)
6. Login as admin
7. See request in pending approvals
8. Approve request (status: APPROVED)

---

## Database Impact

No schema changes required. This is purely business logic implemented in the service layer.

---

## Files Modified

1. ✅ `src/services/request.service.ts` - Auto-status logic
2. ✅ `src/controllers/request.controller.ts` - Pass user role
3. ✅ `src/services/approval.service.ts` - Validation and filtering

---

## Status Values

- `DRAFT` - Request created but not submitted
- `SUBMITTED` - Employee request awaiting manager approval
- `SEMI_APPROVED` - Manager-approved OR manager request awaiting admin approval
- `APPROVED` - Admin-approved, ready for payment
- `REJECTED` - Rejected by manager or admin
- `PAID` - Payment processed
