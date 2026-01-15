import type { DueDateStatus } from '../types/todo'

/**
 * 期限状態を判定する
 */
export function getDueDateStatus(dueDate: string | null, completed: boolean): DueDateStatus {
  if (completed) return 'no-due-date'
  if (dueDate === null) return 'no-due-date'

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const due = new Date(dueDate + 'T23:59:59')
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (dueDate < todayStr) return 'overdue'
  if (diffHours <= 24) return 'due-soon'
  return 'on-time'
}

/**
 * 日付文字列が有効なYYYY-MM-DD形式かを検証
 */
export function isValidDueDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  // パースした結果が入力と一致するか確認（2025-02-30が2025-03-02にならないようチェック）
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/**
 * 日付を表示用フォーマットに変換
 */
export function formatDueDate(dueDate: string | null): string {
  if (dueDate === null) return '期限なし'
  const date = new Date(dueDate)
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * 今日の日付かどうかを判定
 */
export function isToday(dueDate: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dueDate === today
}

/**
 * 今週（月曜〜日曜）以内かどうかを判定
 */
export function isThisWeek(dueDate: string): boolean {
  const date = new Date(dueDate)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() + diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return date >= startOfWeek && date <= endOfWeek
}

/**
 * 今月以内かどうかを判定
 */
export function isThisMonth(dueDate: string): boolean {
  const date = new Date(dueDate)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

/**
 * 期限切れかどうかを判定（未完了かつ期限が過去）
 */
export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (completed || dueDate === null) return false
  const today = new Date().toISOString().split('T')[0]
  return dueDate < today
}
