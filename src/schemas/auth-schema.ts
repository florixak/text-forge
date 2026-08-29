import * as z from 'zod'

const email = z.string().email('Invalid email address')
const password = z.string().min(8, 'Password must be at least 8 characters')

export const loginFormSchema = z.object({
  email,
  password,
})

export const signUpFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email,
    password,
    confirmPassword: password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
