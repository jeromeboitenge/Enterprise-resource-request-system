export interface userInterface {
    name: string,
    email: string,
    role: roles
}

enum roles {
    Employee = 'employee',
    Manager = 'manager',
    Admin = 'admin',
    Finance = 'finance'

}