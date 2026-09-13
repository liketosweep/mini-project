import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
    username: z
      .string()
      .trim()
      .min(3, { message: 'Username must be at least 3 characters.' })
      .max(30, { message: 'Username cannot exceed 30 characters.' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores.',
      }),
    display_name: z
      .string()
      .trim()
      .min(2, { message: 'Display name must be at least 2 characters.' })
      .max(50, { message: 'Display name cannot exceed 50 characters.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, { message: 'Display name must be at least 2 characters.' })
    .max(50, { message: 'Display name cannot exceed 50 characters.' }),
  username: z
    .string()
    .trim()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(30, { message: 'Username cannot exceed 30 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    }),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
