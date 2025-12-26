export interface UserInterface {
    _id?: string;
    name: string,
    email: string,
    password: string
    role: roles
    department: string
    createdAt: Date
}

enum roles {
    Employee = 'employee',
    Manager = 'manager',
    Admin = 'admin',
    Finance = 'finance'

}