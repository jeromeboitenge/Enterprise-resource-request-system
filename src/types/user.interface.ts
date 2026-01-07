export interface UserInterface {
    name: string;
    email: string;
    password: string;
    role: Roles;
    department: string;
    isActive: boolean;
    loginAttempts?: number;
    lockUntil?: Date;
    refreshToken?: string;
    createdAt: Date;
    updatedAt?: Date;
}

// Updated to match Prisma UserRole schema
export enum Roles {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE'
}