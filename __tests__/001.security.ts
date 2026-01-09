import { expect, test, describe } from '@jest/globals'
import { comparePassword, hashPassword } from '../src/utils/Security'

describe('security ', () => {
    test('hashing password returns string', () => {
        const password = 'Boitenge12!'
        const hashedPassword = hashPassword(password)
        expect(typeof (hashedPassword)).toBe('string')
        expect(hashedPassword.length).toBe(60)
        expect(hashPassword).not.toBe(password)
    })
    test('hashing same passwords returns string', () => {
        const password = "boitenge12"
        const hash1 = hashPassword(password)
        const hash2 = hashPassword(password)
        expect(hash1).not.toBe(hash2)
    })
})
describe('comparePasswords', () => {
    test('compare password', () => {
        const password = 'booitenge';
        const hashed = hashPassword(password)
        expect(comparePassword(hashed, password)).toBeTruthy()
    })
})