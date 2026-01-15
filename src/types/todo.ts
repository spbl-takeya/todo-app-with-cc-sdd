/**
 * TODOアイテムの型定義
 */
export interface TodoItem {
  /**
   * 一意の識別子（UUID v4形式）
   */
  id: string

  /**
   * TODOのタイトル
   */
  title: string

  /**
   * 完了状態
   */
  completed: boolean

  /**
   * 作成日時（ISO 8601形式）
   */
  createdAt: string

  /**
   * 完了日時（ISO 8601形式、未完了の場合はnull）
   */
  completedAt: string | null

  /**
   * 期限日（ISO 8601形式 YYYY-MM-DD、未設定の場合はnull）
   */
  dueDate: string | null
}

/**
 * 成功/失敗を表すResult型
 */
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E }

/**
 * TODOアイテム作成時のエラー型
 */
export interface CreateTodoError {
  type: 'INVALID_TITLE' | 'STORAGE_ERROR'
  message: string
}

/**
 * TODOアイテム完了切り替え時のエラー型
 */
export interface ToggleTodoError {
  type: 'TODO_NOT_FOUND' | 'STORAGE_ERROR'
  message: string
}

/**
 * TODOアイテム削除時のエラー型
 */
export interface DeleteTodoError {
  type: 'TODO_NOT_FOUND' | 'STORAGE_ERROR'
  message: string
}

/**
 * ストレージ操作時のエラー型
 */
export interface StorageError {
  type: 'STORAGE_UNAVAILABLE' | 'QUOTA_EXCEEDED' | 'PARSE_ERROR'
  message: string
}

/**
 * 期限更新時のエラー型
 */
export interface UpdateDueDateError {
  type: 'INVALID_DUE_DATE' | 'TODO_NOT_FOUND' | 'STORAGE_ERROR'
  message: string
}

/**
 * 期限の状態
 */
export type DueDateStatus = 'overdue' | 'due-soon' | 'on-time' | 'no-due-date'

/**
 * ソートオプション
 */
export type SortOption = 'created-asc' | 'created-desc' | 'due-date-asc' | 'due-date-desc'

/**
 * フィルターオプション
 */
export type FilterOption = 'all' | 'overdue' | 'today' | 'this-week' | 'this-month' | 'no-due-date'
