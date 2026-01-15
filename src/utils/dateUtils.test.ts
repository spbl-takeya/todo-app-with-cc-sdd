import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDueDateStatus,
  isValidDueDate,
  formatDueDate,
  isToday,
  isThisWeek,
  isThisMonth,
  isOverdue,
} from './dateUtils'

describe('dateUtils', () => {
  describe('getDueDateStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('完了済みアイテムはno-due-dateを返す', () => {
      expect(getDueDateStatus('2025-01-10', true)).toBe('no-due-date')
    })

    it('期限未設定はno-due-dateを返す', () => {
      expect(getDueDateStatus(null, false)).toBe('no-due-date')
    })

    it('期限切れはoverdueを返す', () => {
      expect(getDueDateStatus('2025-01-14', false)).toBe('overdue')
    })

    it('24時間以内の期限はdue-soonを返す', () => {
      expect(getDueDateStatus('2025-01-15', false)).toBe('due-soon')
    })

    it('24時間以上先の期限はon-timeを返す', () => {
      expect(getDueDateStatus('2025-01-20', false)).toBe('on-time')
    })
  })

  describe('isValidDueDate', () => {
    it('有効なYYYY-MM-DD形式を受け入れる', () => {
      expect(isValidDueDate('2025-01-15')).toBe(true)
      expect(isValidDueDate('2025-12-31')).toBe(true)
    })

    it('無効な形式を拒否する', () => {
      expect(isValidDueDate('2025/01/15')).toBe(false)
      expect(isValidDueDate('01-15-2025')).toBe(false)
      expect(isValidDueDate('2025-1-15')).toBe(false)
      expect(isValidDueDate('invalid')).toBe(false)
      expect(isValidDueDate('')).toBe(false)
    })

    it('存在しない日付を拒否する', () => {
      expect(isValidDueDate('2025-02-30')).toBe(false)
      expect(isValidDueDate('2025-13-01')).toBe(false)
    })
  })

  describe('formatDueDate', () => {
    it('nullの場合は「期限なし」を返す', () => {
      expect(formatDueDate(null)).toBe('期限なし')
    })

    it('日付を日本語形式でフォーマットする', () => {
      const result = formatDueDate('2025-01-15')
      expect(result).toContain('2025')
      expect(result).toContain('1')
      expect(result).toContain('15')
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('今日の日付はtrueを返す', () => {
      expect(isToday('2025-01-15')).toBe(true)
    })

    it('今日以外の日付はfalseを返す', () => {
      expect(isToday('2025-01-14')).toBe(false)
      expect(isToday('2025-01-16')).toBe(false)
    })
  })

  describe('isThisWeek', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      // 2025-01-15 is Wednesday
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('今週の日付はtrueを返す', () => {
      // Monday to Sunday of this week: 2025-01-13 to 2025-01-19
      expect(isThisWeek('2025-01-13')).toBe(true) // Monday
      expect(isThisWeek('2025-01-15')).toBe(true) // Wednesday
      expect(isThisWeek('2025-01-19')).toBe(true) // Sunday
    })

    it('今週以外の日付はfalseを返す', () => {
      expect(isThisWeek('2025-01-12')).toBe(false) // Previous Sunday
      expect(isThisWeek('2025-01-20')).toBe(false) // Next Monday
    })
  })

  describe('isThisMonth', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('今月の日付はtrueを返す', () => {
      expect(isThisMonth('2025-01-01')).toBe(true)
      expect(isThisMonth('2025-01-31')).toBe(true)
    })

    it('今月以外の日付はfalseを返す', () => {
      expect(isThisMonth('2024-12-31')).toBe(false)
      expect(isThisMonth('2025-02-01')).toBe(false)
    })
  })

  describe('isOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('未完了かつ期限切れはtrueを返す', () => {
      expect(isOverdue('2025-01-14', false)).toBe(true)
    })

    it('完了済みはfalseを返す', () => {
      expect(isOverdue('2025-01-14', true)).toBe(false)
    })

    it('期限未設定はfalseを返す', () => {
      expect(isOverdue(null, false)).toBe(false)
    })

    it('期限が今日以降はfalseを返す', () => {
      expect(isOverdue('2025-01-15', false)).toBe(false)
      expect(isOverdue('2025-01-16', false)).toBe(false)
    })
  })
})
