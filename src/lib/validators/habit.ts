import { z } from 'zod'

export const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Habit title is required.' })
    .max(80, { message: 'Title cannot exceed 80 characters.' }),
  description: z
    .string()
    .trim()
    .max(300, { message: 'Description cannot exceed 300 characters.' })
    .optional(),
  category: z
    .string()
    .trim()
    .min(1, { message: 'Category is required.' })
    .max(40, { message: 'Category cannot exceed 40 characters.' }),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>

export const editHabitSchema = createHabitSchema

export type EditHabitInput = z.infer<typeof editHabitSchema>

export const checkInSchema = z.object({
  note: z
    .string()
    .trim()
    .max(280, { message: 'Note cannot exceed 280 characters.' })
    .optional(),
})

export type CheckInInput = z.infer<typeof checkInSchema>
