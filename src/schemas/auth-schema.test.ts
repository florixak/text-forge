import { describe, expect, it } from 'vitest'
import { loginFormSchema, signUpFormSchema } from './auth-schema'

describe('auth-schema', () => {
  describe('loginFormSchema', () => {
    it('should return true for a valid login form', () => {
      const result = loginFormSchema.safeParse({
        email: 'test@test.com',
        password: '12345678',
      })
      expect(result.success).toBe(true)
    })

    it('should return false for password shorter than 8 characters', () => {
      const result = loginFormSchema.safeParse({
        email: 'test@test.com',
        password: '1234567',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('signUpFormSchema', () => {
    it('should return true for a valid sign up form', () => {
      const result = signUpFormSchema.safeParse({
        name: 'Test User',
        email: 'test@test.com',
        password: '12345678',
        confirmPassword: '12345678',
      })

      expect(result.success).toBe(true)
    })

    it('should return false for password shorter than 8 characters', () => {
      const result = signUpFormSchema.safeParse({
        name: 'Test User',
        email: 'test@test.com',
        password: '1234567',
        confirmPassword: '1234567',
      })
      expect(result.success).toBe(false)
    })

    it('should return false for passwords that do not match', () => {
      const result = signUpFormSchema.safeParse({
        name: 'Test User',
        email: 'test@test.com',
        password: '12345678',
        confirmPassword: '123456789',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === "Passwords don't match",
        )
        expect(issue?.path).toEqual(['confirmPassword'])
      }
    })

    it('should return false for email with invalid format', () => {
      const result = signUpFormSchema.safeParse({
        name: 'Test User',
        email: 'test@test',
        password: '12345678',
        confirmPassword: '12345678',
      })
      expect(result.success).toBe(false)
    })

    it('should return false for name shorter than 2 characters', () => {
      const result = signUpFormSchema.safeParse({
        name: 'T',
        email: 'test@test.com',
        password: '12345678',
        confirmPassword: '12345678',
      })
      expect(result.success).toBe(false)
    })
  })
})
