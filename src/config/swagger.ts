import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Enterprise Resource Request System API',
        version: '1.0.0',
        description: 'API for managing company resource requests, approvals, and payments',
    },
    servers: [
        {
            url: process.env.API_URL || 'http://localhost:3333/api/v1',
            description: 'API Server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['employee', 'manager', 'departmenthead', 'finance', 'admin'] },
                    departmentId: { type: 'string' },
                    isActive: { type: 'boolean' },
                },
            },
            Request: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    resourceName: { type: 'string' },
                    resourceType: { type: 'string' },
                    description: { type: 'string' },
                    quantity: { type: 'integer' },
                    estimatedCost: { type: 'number' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    status: { type: 'string' },
                },
            },
            Payment: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    requestId: { type: 'string' },
                    amountPaid: { type: 'number' },
                    paymentMethod: { type: 'string' },
                    paymentDate: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
    tags: [
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Users', description: 'User management' },
        { name: 'Departments', description: 'Department management' },
        { name: 'Requests', description: 'Resource request management' },
        { name: 'Approvals', description: 'Request approval workflow' },
        { name: 'Payments', description: 'Payment processing' },
        { name: 'Notifications', description: 'User notifications' },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/auth/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
