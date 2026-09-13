import { z } from 'zod'

export const createRoomSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Challenge name must be at least 2 characters.' })
      .max(60, { message: 'Challenge name cannot exceed 60 characters.' }),
    habit_title: z
      .string()
      .trim()
      .min(2, { message: 'Goal title must be at least 2 characters.' })
      .max(80, { message: 'Goal title cannot exceed 80 characters.' }),
    description: z
      .string()
      .trim()
      .max(300, { message: 'Description cannot exceed 300 characters.' })
      .optional()
      .or(z.literal('')),
    entry_points: z
      .number({ message: 'Entry points must be a valid number.' })
      .int({ message: 'Entry points must be a whole integer.' })
      .min(0, { message: 'Entry points cannot be negative.' }),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in YYYY-MM-DD format.' }),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'End date must be in YYYY-MM-DD format.' }),
    acceptance_deadline: z
      .string()
      .min(1, { message: 'Acceptance deadline is required.' }),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after the start date.',
    path: ['end_date'],
  })
  .refine(
    (data) => {
      try {
        const deadlineDate = new Date(data.acceptance_deadline)
        const challengeEndDate = new Date(`${data.end_date}T23:59:59`)
        return deadlineDate <= challengeEndDate
      } catch {
        return false
      }
    },
    {
      message: 'Acceptance deadline cannot be after the challenge end date.',
      path: ['acceptance_deadline'],
    }
  )

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const joinRoomSchema = z.object({
  invite_code: z
    .string()
    .trim()
    .min(3, { message: 'Invite code must be at least 3 characters.' })
    .max(30, { message: 'Invite code cannot exceed 30 characters.' }),
})

export type JoinRoomInput = z.infer<typeof joinRoomSchema>
