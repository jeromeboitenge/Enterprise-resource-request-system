import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Enterprise Resource Request System API',
        version: '1.0.0',
        description: 'A professional backend for managing company resource requests, approvals, and payments.',
        contact: {
            name: 'Jerome Boitenge',
            email: 'support@example.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: 'http://localhost:3333/api/v1',
            description: 'Development server'
        },
        {
            url: 'https://your-production-url.com/api/v1',
            description: 'Production server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1234567890abcdef12345' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john.doe@company.com' },
                    role: { type: 'string', enum: ['employee', 'manager', 'departmenthead', 'finance', 'admin'], example: 'employee' },
                    department: { type: 'string', example: 'IT' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Department: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f9876543210abcdef98765' },
                    name: { type: 'string', example: 'IT' },
                    description: { type: 'string', example: 'Information Technology Department' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Request: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65fa123456789abcdef01234' },
                    userId: { type: 'string', example: '65f1234567890abcdef12345' },
                    departmentId: { type: 'string', example: '65f9876543210abcdef98765' },
                    title: { type: 'string', example: 'New Laptop for Development' },
                    resourceName: { type: 'string', example: 'Dell XPS 15' },
                    resourceType: { type: 'string', example: 'Hardware' },
                    description: { type: 'string', example: 'Need a new laptop for software development work' },
                    quantity: { type: 'number', minimum: 1, example: 1 },
                    estimatedCost: { type: 'number', minimum: 0, example: 1500 },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
                    status: {
                        type: 'string',
                        enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'funded', 'fulfilled', 'cancelled'],
                        example: 'draft'
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Approval: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65fb123456789abcdef01234' },
                    requestId: { type: 'string', example: '65fa123456789abcdef01234' },
                    approverId: { type: 'string', example: '65f1234567890abcdef12345' },
                    decision: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
                    comment: { type: 'string', example: 'Approved for business needs' },
                    decisionDate: { type: 'string', format: 'date-time' }
                }
            },
            Payment: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65fc123456789abcdef01234' },
                    requestId: { type: 'string', example: '65fa123456789abcdef01234' },
                    financeOfficerId: { type: 'string', example: '65f1234567890abcdef12345' },
                    amountPaid: { type: 'number', minimum: 0, example: 1500 },
                    paymentMethod: { type: 'string', enum: ['bank_transfer', 'check', 'cash', 'credit_card'], example: 'bank_transfer' },
                    paymentDate: { type: 'string', format: 'date-time' }
                }
            },
            Notification: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65fd123456789abcdef01234' },
                    userId: { type: 'string', example: '65f1234567890abcdef12345' },
                    title: { type: 'string', example: 'Request Approved' },
                    message: { type: 'string', example: 'Your request has been approved' },
                    type: { type: 'string', enum: ['info', 'success', 'warning', 'error'], example: 'success' },
                    isRead: { type: 'boolean', example: false },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error message' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'email' },
                                message: { type: 'string', example: 'Email is required' }
                            }
                        }
                    }
                }
            },
            Success: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Operation successful' },
                    data: { type: 'object' }
                }
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ],
    tags: [
        { name: 'Authentication', description: 'User authentication and profile management' },
        { name: 'Departments', description: 'Department management' },
        { name: 'Requests', description: 'Resource request management' },
        { name: 'Approvals', description: 'Request approval workflow' },
        { name: 'Payments', description: 'Payment processing' },
        { name: 'Notifications', description: 'User notifications' },
        { name: 'Users', description: 'User management (Admin only)' }
    ]
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
