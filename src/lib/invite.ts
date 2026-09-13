/**
 * Habit Arena - Invite Code & Link Utilities
 * Private invite-only room access helpers.
 */

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excludes 0, O, 1, I for unambiguous reading

/**
 * Generates an 8-character unique alphanumeric invite code.
 * Example: "HA-8K3P9W"
 */
export function generateInviteCode(): string {
  let result = 'HA-'
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length)
    result += CHARSET[randomIndex]
  }
  return result
}

/**
 * Formats a full invite URL given an invite code and optional origin.
 */
export function formatInviteUrl(inviteCode: string, origin?: string): string {
  const base = origin ? origin.replace(/\/$/, '') : ''
  return `${base}/rooms/join/${encodeURIComponent(inviteCode.trim())}`
}
