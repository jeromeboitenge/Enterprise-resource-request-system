export interface UserInterface {

    name: string,
    email: string,
    password: string
    role: Roles
    department: string
    createdAt: Date
}

export enum Roles {
    Employee = 'employee',
    Manager = 'manager',
    Admin = 'admin',
    Finance = 'finance'

}