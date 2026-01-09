import { expect, test, describe } from '@jest/globals'
import { hashPassword } from '../src/utils/Security'

describe('hashing password', () => {
    test('password hashed', () => {
        expect(typeof (hashPassword('Password12!'))).toBe('string')
        expect(hashPassword('Password12!').length).toBe(60)
    })
})