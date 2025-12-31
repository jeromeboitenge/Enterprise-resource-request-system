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

export enum Roles {
    Employee = 'employee',
    Manager = 'manager',
    DepartmentHead = 'departmenthead',
    Finance = 'finance',
    Admin = 'admin'
}