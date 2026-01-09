import { expect, test, describe } from '@jest/globals'
import { comparePassword, hashPassword } from '../src/utils/Security'

describe('security ', () => {
    test('hashing password returns string', async () => {
        const password = 'Boitenge12!'
        const hashedPassword = hashPassword(password)
        expect(typeof (hashedPassword)).toBe('string')
        expect(hashedPassword.length).toBe(60)
        expect(hashPassword).not.toBe(password)
    })
    test('hashing same passwords returns string', async () => {
        const password = "boitenge12"
        const hash1 = hashPassword(password)
        const hash2 = hashPassword(password)
        expect(hash1).not.toBe(hash2)
    })
})
describe('comparePasswords', () => {
    test('compare password', async () => {
        const password = 'booitenge';
        const hashed = hashPassword(password)
        const result = comparePassword(password, hashed)
        expect(result).toBe(true)
    })
    test('returns false for different password', async () => {
        const password = 'Password'
        const wrongPassword = 'Passward'
        const hashed = hashPassword(password)
        const result = await comparePassword(wrongPassword, hashed)
        expect(result).toBe(false)
    })
})