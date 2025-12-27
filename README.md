# Enterprise Resource Request System

A complete, production-ready **Enterprise Resource Request System** with Node.js backend and Next.js frontend, featuring multi-level approval workflows, role-based access control, notifications, and audit logging.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- **Enhanced User Management** - 5 roles with activation status
- **Comprehensive Request System** - 8-state workflow with priority levels
- **Multi-Level Approval** - Sequential approval chain (Manager → Dept Head → Finance → Admin)
- **Notification System** - Real-time notifications with 8 event types
- **Audit Logging** - Immutable audit trail for compliance
- **Payment Processing** - Finance team payment management
- **Security** - JWT auth, password hashing, RBAC, CORS, Helmet
- **Input Validation** - Comprehensive Joi validation

### Frontend (Next.js + TypeScript + Tailwind)
- **Modern UI** - Responsive design with Tailwind CSS
- **Role-Based Navigation** - Dynamic menu based on user role
- **Dashboard** - Statistics and quick actions
- **Request Management** - Create, view, update, delete requests
- **Approval Workflow** - Visual approval process
- **Notifications** - In-app notification center

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd R2p
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5500
PREFIX=/api/v1

DATABASE_URL=mongodb+srv://<db_username>:<db_password>@cluster0.bktbm8k.mongodb.net/?appName=Cluster0
DATABASE_USERNAME=your_username
PASSWORD=your_password

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1d

CORS_ORIGIN=*
NODE_ENV=development
```

4. Build the project
```bash
npm run build
```

5. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd ../r2p-frontend
```

2. Install dependencies
```bash
npm install
npm install axios next-auth @heroicons/react date-fns zustand
```

3. Configure environment

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5500/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Run development server
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 📚 API Documentation

Base URL: `http://localhost:5500/api/v1`

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (Protected)
- `PUT /auth/profile` - Update user profile (Protected)

### Department Endpoints

- `POST /departments` - Create department (Admin only)
- `GET /departments` - Get all departments
- `GET /departments/:id` - Get single department
- `PUT /departments/:id` - Update department (Admin only)
- `DELETE /departments/:id` - Delete department (Admin only)

### Request Endpoints

- `POST /requests` - Create resource request
- `GET /requests/my` - Get my requests
- `GET /requests` - Get all requests (Manager/Finance/Admin)
- `GET /requests/:id` - Get single request
- `PUT /requests/:id` - Update request (Owner, Draft/Submitted only)
- `DELETE /requests/:id` - Delete request (Owner, Draft/Submitted only)

### Approval Endpoints

- `POST /approvals/:requestId/approve` - Approve request (Manager/Admin)
- `POST /approvals/:requestId/reject` - Reject request (Manager/Admin)
- `GET /approvals/:requestId` - Get approval history

### Payment Endpoints

- `POST /payments/:requestId` - Process payment (Finance/Admin)
- `GET /payments` - Get payment history (Finance/Admin)
- `GET /payments/:id` - Get single payment (Finance/Admin)

### Notification Endpoints

- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

## 👥 User Roles

- **Employee** - Can create and manage own requests
- **Manager** - Can approve/reject requests (Level 1)
- **Department Head** - Department-level approvals (Level 2)
- **Finance** - Can process payments for approved requests (Level 3)
- **Admin** - Full access to all operations (Level 4)

## 🔄 Request Workflow

```
Draft → Submitted → Under Review → Approved → Funded → Fulfilled
                                 ↓
                              Rejected
```

**Status Flow:**
1. Employee creates request (Draft)
2. Employee submits request (Submitted)
3. Manager reviews (Under Review)
4. Multi-level approval process
5. Finance processes payment (Funded)
6. Request completed (Fulfilled)

## 🔒 Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Role-based access control (RBAC)
- Input validation with Joi
- Security headers with Helmet
- CORS protection
- Request logging with Morgan
- Global error handling
- Immutable audit logs

## 📁 Project Structure

### Backend
```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── model/          # Mongoose models
├── routes/         # API routes
├── schema/         # Validation schemas
├── services/       # Business logic services
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
└── server.ts       # Application entry point
```

### Frontend
```
app/
├── (auth)/         # Authentication pages
├── (dashboard)/    # Protected dashboard pages
├── api/           # API routes
├── layout.tsx     # Root layout
└── page.tsx       # Home page

components/
├── ui/            # Reusable UI components
├── layout/        # Layout components
├── auth/          # Auth components
├── dashboard/     # Dashboard components
└── requests/      # Request components

services/          # API integration
types/             # TypeScript types
lib/               # Utilities
```

## 🧪 Testing

Build the project to verify everything works:

```bash
# Backend
cd R2p
npm run build

# Frontend
cd ../r2p-frontend
npm run build
```

## 📝 Example Usage

### 1. Register a User

```bash
curl -X POST http://localhost:5500/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "password": "password123",
    "role": "employee",
    "department": "IT"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5500/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "password123"
  }'
```

### 3. Create Request (with token)

```bash
curl -X POST http://localhost:5500/api/v1/requests \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Laptop Request",
    "resourceName": "Dell XPS 15",
    "resourceType": "Hardware",
    "description": "For development work",
    "quantity": 1,
    "estimatedCost": 1500,
    "priority": "high",
    "departmentId": "<department_id>"
  }'
```

## 🛡️ Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": [...]
}
```

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Jerome Boitenge

## 🙏 Acknowledgments

- Express.js for the web framework
- Next.js for the frontend framework
- MongoDB for the database
- JWT for authentication
- Joi for validation
- TypeScript for type safety
- Tailwind CSS for styling

## 📞 Support

For detailed implementation guides, see:
- `walkthrough.md` - Backend implementation details
- `frontend_guide.md` - Frontend setup and code
- `system_summary.md` - Complete system overview

---

**Status**: Backend 70% Complete | Frontend Project Created  
**Version**: 1.0.0  
**Last Updated**: December 27, 2025
