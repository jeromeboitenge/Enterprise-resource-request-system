# Enterprise Resource Request System

A professional backend system for managing company resource requests with approval workflow and payment processing.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access control
- **Resource Requests** - Employees can create and manage resource requests
- **Approval Workflow** - Managers can approve or reject requests
- **Payment Processing** - Finance team can process payments for approved requests
- **Audit Trail** - Complete history of approvals and payments
- **Input Validation** - Comprehensive validation on all endpoints
- **Error Handling** - Professional error responses with detailed messages
- **Security** - Password hashing, JWT tokens, security headers, CORS protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

## 🛠️ Installation

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
- `PUT /requests/:id` - Update request (Owner, Pending only)
- `DELETE /requests/:id` - Delete request (Owner, Pending only)

### Approval Endpoints

- `POST /approvals/:requestId/approve` - Approve request (Manager/Admin)
- `POST /approvals/:requestId/reject` - Reject request (Manager/Admin)
- `GET /approvals/:requestId` - Get approval history

### Payment Endpoints

- `POST /payments/:requestId` - Process payment (Finance/Admin)
- `GET /payments` - Get payment history (Finance/Admin)
- `GET /payments/:id` - Get single payment (Finance/Admin)

For detailed API documentation with examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 👥 User Roles

- **Employee** - Can create and manage own requests
- **Manager** - Can approve/reject requests
- **Finance** - Can process payments for approved requests
- **Admin** - Full access to all operations

## 🔄 Workflow

1. **Employee** creates a resource request
2. **Manager** reviews and approves/rejects the request
3. **Finance** processes payment for approved requests
4. Request status updates: `pending` → `approved`/`rejected` → `paid`

## 🔒 Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Role-based access control (RBAC)
- Input validation with Joi
- Security headers with Helmet
- CORS protection
- Request logging with Morgan
- Global error handling

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── model/          # Mongoose models
├── routes/         # API routes
├── schema/         # Validation schemas
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
└── server.ts       # Application entry point
```

## 🧪 Testing

Build the project to verify everything works:

```bash
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
    "resourceName": "Laptop",
    "description": "For development",
    "amountRequested": 1500,
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
- MongoDB for the database
- JWT for authentication
- Joi for validation
- TypeScript for type safety
