# Department Manager Assignment API

## Overview

Admin can assign and remove managers from departments using the Department Manager API endpoints.

---

## Endpoints

### 1. Assign Manager to Department

**Endpoint:** `POST /api/departments/:departmentId/managers`

**Authorization:** ADMIN only

**Description:** Assigns a user with MANAGER role to a department

**Request:**
```http
POST /api/departments/986ef766-7d71-4260-a717-20d65a9c08d8/managers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "bde50b1c-474a-41cf-8af2-0fb53dd79e79"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Manager assigned to department successfully",
  "data": {
    "assignment": {
      "id": "assignment-uuid",
      "userId": "bde50b1c-474a-41cf-8af2-0fb53dd79e79",
      "departmentId": "986ef766-7d71-4260-a717-20d65a9c08d8",
      "assignedAt": "2024-01-08T10:00:00Z",
      "user": {
        "id": "bde50b1c-474a-41cf-8af2-0fb53dd79e79",
        "name": "IT Manager",
        "email": "it-manager@company.com",
        "role": "MANAGER"
      },
      "department": {
        "id": "986ef766-7d71-4260-a717-20d65a9c08d8",
        "name": "IT",
        "code": "IT"
      }
    }
  }
}
```

**Error Responses:**

**404 Not Found** - Department not found
```json
{
  "success": false,
  "message": "Department not found"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request** - User is not a manager
```json
{
  "success": false,
  "message": "User must have MANAGER role to be assigned as department manager"
}
```

**409 Conflict** - Already assigned
```json
{
  "success": false,
  "message": "This user is already a manager of this department"
}
```

---

### 2. Remove Manager from Department

**Endpoint:** `DELETE /api/departments/:departmentId/managers/:userId`

**Authorization:** ADMIN only

**Description:** Removes a manager assignment from a department

**Request:**
```http
DELETE /api/departments/986ef766-7d71-4260-a717-20d65a9c08d8/managers/bde50b1c-474a-41cf-8af2-0fb53dd79e79
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Manager removed from department successfully",
  "data": {
    "assignment": {
      "id": "assignment-uuid",
      "userId": "bde50b1c-474a-41cf-8af2-0fb53dd79e79",
      "departmentId": "986ef766-7d71-4260-a717-20d65a9c08d8",
      "assignedAt": "2024-01-08T10:00:00Z",
      "user": {
        "name": "IT Manager"
      },
      "department": {
        "name": "IT"
      }
    }
  }
}
```

**Error Response:**

**404 Not Found** - Assignment not found
```json
{
  "success": false,
  "message": "Manager assignment not found"
}
```

---

### 3. Get Department Managers

**Endpoint:** `GET /api/departments/:departmentId/managers`

**Authorization:** All authenticated users

**Description:** Lists all managers assigned to a department

**Request:**
```http
GET /api/departments/986ef766-7d71-4260-a717-20d65a9c08d8/managers
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Department managers retrieved successfully",
  "data": {
    "department": {
      "id": "986ef766-7d71-4260-a717-20d65a9c08d8",
      "name": "IT"
    },
    "managers": [
      {
        "id": "bde50b1c-474a-41cf-8af2-0fb53dd79e79",
        "name": "IT Manager",
        "email": "it-manager@company.com",
        "role": "MANAGER",
        "isActive": true,
        "assignedAt": "2024-01-08T10:00:00Z"
      }
    ]
  }
}
```

**Error Response:**

**404 Not Found** - Department not found
```json
{
  "success": false,
  "message": "Department not found"
}
```

---

## Usage Examples

### Example 1: Assign a Manager to IT Department

**Step 1:** Get the department ID
```bash
GET /api/departments
```

**Step 2:** Get the user ID (must be a MANAGER)
```bash
GET /api/users?role=MANAGER
```

**Step 3:** Assign the manager
```bash
POST /api/departments/986ef766-7d71-4260-a717-20d65a9c08d8/managers
{
  "userId": "bde50b1c-474a-41cf-8af2-0fb53dd79e79"
}
```

---

### Example 2: View All Managers of a Department

```bash
GET /api/departments/986ef766-7d71-4260-a717-20d65a9c08d8/managers
```

---

### Example 3: Remove a Manager from Department

```bash
DELETE /api/departments/986ef766-7d71-4260-a717-20d65a9c08d8/managers/bde50b1c-474a-41cf-8af2-0fb53dd79e79
```

---

## Business Rules

1. ✅ Only users with **MANAGER** role can be assigned as department managers
2. ✅ A user can be a manager of **multiple departments**
3. ✅ A department can have **multiple managers**
4. ✅ Only **ADMIN** can assign/remove managers
5. ✅ **Anyone** can view department managers
6. ✅ Cannot assign the same user to the same department twice

---

## Database Structure

The `department_managers` junction table stores the assignments:

```prisma
model DepartmentManager {
  id           String @id @default(uuid())
  userId       String
  departmentId String

  assignedAt DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  department Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)

  @@unique([userId, departmentId])
  @@map("department_managers")
}
```

---

## Notes

- When a department is deleted, all manager assignments are automatically removed (cascade delete)
- When a user is deleted, all their manager assignments are automatically removed (cascade delete)
- The `@@unique([userId, departmentId])` constraint prevents duplicate assignments
- Managers are ordered by `assignedAt` (most recent first) when listing

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/departments/:departmentId/managers` | ADMIN | Assign manager |
| DELETE | `/departments/:departmentId/managers/:userId` | ADMIN | Remove manager |
| GET | `/departments/:departmentId/managers` | All | List managers |
