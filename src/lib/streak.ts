import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns'

/**
 * Returns a calendar date string formatted as 'YYYY-MM-DD' in the user's local timezone.
 */
export function formatLocalDate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Returns the calendar date string for yesterday ('YYYY-MM-DD') based on the reference date.
 */
export function getYesterdayDate(referenceDateStr?: string): string {
  const baseDate = referenceDateStr ? parseISO(referenceDateStr) : new Date()
  return format(subDays(baseDate, 1), 'yyyy-MM-dd')
}

/**
 * Checks whether the habit has already been completed today.
 */
export function isTodayCompleted(
  lastCompletedDate: string | null,
  todayStr: string = formatLocalDate()
): boolean {
  if (!lastCompletedDate) return false
  return lastCompletedDate === todayStr
}

/**
 * Determines the live active streak.
 * If the habit was completed today or yesterday, the streak is alive.
 * If more than 1 day has passed without a check-in, the streak is broken (0).
 */
export function calculateActiveStreak(
  lastCompletedDate: string | null,
  recordedStreak: number,
  todayStr: string = formatLocalDate()
): number {
  if (!lastCompletedDate || recordedStreak <= 0) {
    return 0
  }

  const today = parseISO(todayStr)
  const lastDate = parseISO(lastCompletedDate)
  const daysDiff = differenceInCalendarDays(today, lastDate)

  // 0: completed today -> streak is active
  // 1: completed yesterday, not yet today -> streak is still active
  if (daysDiff <= 1 && daysDiff >= 0) {
    return recordedStreak
  }

  // More than 1 day has elapsed without checking in
  return 0
}

/**
 * Computes exact streaks, longest streaks, and completion state from an array of check-in dates.
 */
export function computeStreaksFromLogs(
  logDates: string[],
  todayStr: string = formatLocalDate()
): {
  currentStreak: number
  longestStreak: number
  totalCheckIns: number
  isCompletedToday: boolean
} {
  const uniqueDates = Array.from(new Set(logDates)).sort((a, b) => b.localeCompare(a))
  const totalCheckIns = uniqueDates.length

  if (totalCheckIns === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      isCompletedToday: false,
    }
  }

  const isCompletedToday = uniqueDates.includes(todayStr)
  const yesterdayStr = getYesterdayDate(todayStr)
  const isCompletedYesterday = uniqueDates.includes(yesterdayStr)

  // 1. Calculate current streak
  let currentStreak = 0
  if (isCompletedToday || isCompletedYesterday) {
    let expectedDate = isCompletedToday ? parseISO(todayStr) : parseISO(yesterdayStr)

    for (const dateStr of uniqueDates) {
      const logDate = parseISO(dateStr)
      if (differenceInCalendarDays(expectedDate, logDate) === 0) {
        currentStreak++
        expectedDate = subDays(expectedDate, 1)
      } else if (differenceInCalendarDays(expectedDate, logDate) > 0) {
        // Missed day reached
        break
      }
    }
  }

  // 2. Calculate longest streak across all history
  let longestStreak = 0
  let tempStreak = 0
  const ascendingDates = [...uniqueDates].reverse()

  for (let i = 0; i < ascendingDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = parseISO(ascendingDates[i - 1])
      const curr = parseISO(ascendingDates[i])
      const diff = differenceInCalendarDays(curr, prev)

      if (diff === 1) {
        tempStreak++
      } else if (diff > 1) {
        tempStreak = 1
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalCheckIns,
    isCompletedToday,
  }
}
