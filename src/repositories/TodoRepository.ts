import type { TodoItem, Result, StorageError } from '../types/todo'

/**
 * TodoアイテムのLocalStorage永続化を担当するRepository
 */
export class TodoRepository {
  private readonly STORAGE_KEY = 'todos'

  /**
   * STORAGE_UNAVAILABLEエラーを生成するヘルパーメソッド
   */
  private createStorageUnavailableError(message: string): Result<never, StorageError> {
    return {
      success: false,
      error: {
        type: 'STORAGE_UNAVAILABLE',
        message,
      },
    }
  }

  /**
   * LocalStorageが利用可能かチェック
   */
  checkStorageAvailable(): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false
      }
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * TodoアイテムリストをLocalStorageに保存
   */
  saveTodos(todos: TodoItem[]): Result<void, StorageError> {
    if (!this.checkStorageAvailable()) {
      return this.createStorageUnavailableError('LocalStorageが利用できません')
    }

    try {
      const jsonString = JSON.stringify(todos)
      localStorage.setItem(this.STORAGE_KEY, jsonString)
      return { success: true, value: undefined }
    } catch (error) {
      // QuotaExceededError の検出
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: {
            type: 'QUOTA_EXCEEDED',
            message: 'ストレージ容量が不足しています',
          },
        }
      }
      return this.createStorageUnavailableError('データの保存に失敗しました')
    }
  }

  /**
   * LocalStorageからTodoアイテムリストを読み込み
   */
  loadTodos(): Result<TodoItem[], StorageError> {
    if (!this.checkStorageAvailable()) {
      return this.createStorageUnavailableError('LocalStorageが利用できません')
    }

    try {
      const jsonString = localStorage.getItem(this.STORAGE_KEY)

      // データが存在しない場合は空配列を返す
      if (jsonString === null) {
        return { success: true, value: [] }
      }

      // 後方互換性: dueDateフィールドがない既存データにnullを設定
      const rawTodos = JSON.parse(jsonString) as Partial<TodoItem>[]
      const todos: TodoItem[] = rawTodos.map(todo => ({
        ...todo,
        dueDate: todo.dueDate ?? null,
      } as TodoItem))
      return { success: true, value: todos }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'PARSE_ERROR',
          message: 'データのパースに失敗しました',
        },
      }
    }
  }

  /**
   * LocalStorageのTodoデータをクリア
   */
  clearTodos(): Result<void, StorageError> {
    if (!this.checkStorageAvailable()) {
      return this.createStorageUnavailableError('LocalStorageが利用できません')
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return { success: true, value: undefined }
    } catch (error) {
      return this.createStorageUnavailableError('データのクリアに失敗しました')
    }
  }
}
