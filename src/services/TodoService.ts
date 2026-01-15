import type {
  TodoItem,
  Result,
  CreateTodoError,
  ToggleTodoError,
  DeleteTodoError,
  StorageError,
  UpdateDueDateError,
  SortOption,
  FilterOption,
} from '../types/todo'
import { isValidDueDate, isToday, isThisWeek, isThisMonth, isOverdue } from '../utils/dateUtils'
import type { TodoRepository } from '../repositories/TodoRepository'

/**
 * TODOアイテムのビジネスロジックを担当するService
 */
export class TodoService {
  private todos: TodoItem[] = []

  constructor(private readonly repository: TodoRepository) {}

  /**
   * STORAGE_ERRORを生成するヘルパーメソッド
   */
  private createStorageError(): { type: 'STORAGE_ERROR'; message: string } {
    return {
      type: 'STORAGE_ERROR',
      message: 'データの保存に失敗しました',
    }
  }

  /**
   * Repositoryからデータを読み込む
   */
  loadTodos(): Result<void, StorageError> {
    const result = this.repository.loadTodos()

    if (!result.success) {
      return result
    }

    this.todos = result.value
    return { success: true, value: undefined }
  }

  /**
   * すべてのTodoアイテムを取得
   */
  getAllTodos(): TodoItem[] {
    return [...this.todos]
  }

  /**
   * IDでTodoアイテムを取得
   */
  getTodoById(id: string): TodoItem | null {
    const todo = this.todos.find(t => t.id === id)
    return todo ? { ...todo } : null
  }

  /**
   * 新しいTodoアイテムを作成
   */
  createTodo(title: string, dueDate: string | null = null): Result<TodoItem, CreateTodoError> {
    // バリデーション: 空タイトルチェック
    if (title.trim() === '') {
      return {
        success: false,
        error: {
          type: 'INVALID_TITLE',
          message: 'タイトルを入力してください',
        },
      }
    }

    // バリデーション: 期限日形式チェック
    if (dueDate !== null && !isValidDueDate(dueDate)) {
      return {
        success: false,
        error: {
          type: 'INVALID_TITLE',
          message: '無効な日付形式です',
        },
      }
    }

    // 新しいTodoアイテムを作成
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      dueDate,
    }

    // メモリ内リストに追加
    this.todos.push(newTodo)

    // Repositoryに保存
    const saveResult = this.repository.saveTodos(this.todos)
    if (!saveResult.success) {
      // 保存失敗時はロールバック
      this.todos.pop()
      return {
        success: false,
        error: this.createStorageError(),
      }
    }

    return { success: true, value: { ...newTodo } }
  }

  /**
   * Todoアイテムの完了状態を切り替え
   */
  toggleTodo(id: string): Result<TodoItem, ToggleTodoError> {
    // アイテムの存在確認
    const index = this.todos.findIndex(t => t.id === id)
    if (index === -1) {
      return {
        success: false,
        error: {
          type: 'TODO_NOT_FOUND',
          message: 'TODOアイテムが見つかりません',
        },
      }
    }

    // 現在の状態をバックアップ（ロールバック用）
    const originalTodo = { ...this.todos[index] }

    // 完了状態を切り替え
    const updatedTodo: TodoItem = {
      ...this.todos[index],
      completed: !this.todos[index].completed,
      completedAt: !this.todos[index].completed ? new Date().toISOString() : null,
    }

    // メモリ内リストを更新
    this.todos[index] = updatedTodo

    // Repositoryに保存
    const saveResult = this.repository.saveTodos(this.todos)
    if (!saveResult.success) {
      // 保存失敗時はロールバック
      this.todos[index] = originalTodo
      return {
        success: false,
        error: this.createStorageError(),
      }
    }

    return { success: true, value: { ...updatedTodo } }
  }

  /**
   * Todoアイテムを削除
   */
  deleteTodo(id: string): Result<void, DeleteTodoError> {
    // アイテムの存在確認
    const index = this.todos.findIndex(t => t.id === id)
    if (index === -1) {
      return {
        success: false,
        error: {
          type: 'TODO_NOT_FOUND',
          message: 'TODOアイテムが見つかりません',
        },
      }
    }

    // バックアップ（ロールバック用）
    const deletedTodo = this.todos[index]

    // メモリ内リストから削除
    this.todos.splice(index, 1)

    // Repositoryに保存
    const saveResult = this.repository.saveTodos(this.todos)
    if (!saveResult.success) {
      // 保存失敗時はロールバック
      this.todos.splice(index, 0, deletedTodo)
      return {
        success: false,
        error: this.createStorageError(),
      }
    }

    return { success: true, value: undefined }
  }

  /**
   * Todoアイテムの期限を更新
   */
  updateDueDate(id: string, dueDate: string | null): Result<TodoItem, UpdateDueDateError> {
    // バリデーション: 期限日形式チェック
    if (dueDate !== null && !isValidDueDate(dueDate)) {
      return {
        success: false,
        error: {
          type: 'INVALID_DUE_DATE',
          message: '無効な日付形式です',
        },
      }
    }

    // アイテムの存在確認
    const index = this.todos.findIndex(t => t.id === id)
    if (index === -1) {
      return {
        success: false,
        error: {
          type: 'TODO_NOT_FOUND',
          message: 'TODOアイテムが見つかりません',
        },
      }
    }

    // 現在の状態をバックアップ（ロールバック用）
    const originalTodo = { ...this.todos[index] }

    // 期限を更新
    const updatedTodo: TodoItem = {
      ...this.todos[index],
      dueDate,
    }

    // メモリ内リストを更新
    this.todos[index] = updatedTodo

    // Repositoryに保存
    const saveResult = this.repository.saveTodos(this.todos)
    if (!saveResult.success) {
      // 保存失敗時はロールバック
      this.todos[index] = originalTodo
      return {
        success: false,
        error: {
          type: 'STORAGE_ERROR',
          message: 'データの保存に失敗しました',
        },
      }
    }

    return { success: true, value: { ...updatedTodo } }
  }

  /**
   * Todoアイテムをソートして取得
   */
  getSortedTodos(sortOption: SortOption): TodoItem[] {
    const todos = [...this.todos]

    switch (sortOption) {
      case 'due-date-asc':
        return todos.sort((a, b) => {
          if (a.dueDate === null && b.dueDate === null) {
            return a.createdAt.localeCompare(b.createdAt)
          }
          if (a.dueDate === null) return 1
          if (b.dueDate === null) return -1
          const cmp = a.dueDate.localeCompare(b.dueDate)
          return cmp !== 0 ? cmp : a.createdAt.localeCompare(b.createdAt)
        })
      case 'due-date-desc':
        return todos.sort((a, b) => {
          if (a.dueDate === null && b.dueDate === null) {
            return a.createdAt.localeCompare(b.createdAt)
          }
          if (a.dueDate === null) return 1
          if (b.dueDate === null) return -1
          const cmp = b.dueDate.localeCompare(a.dueDate)
          return cmp !== 0 ? cmp : a.createdAt.localeCompare(b.createdAt)
        })
      case 'created-asc':
        return todos.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      case 'created-desc':
        return todos.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      default:
        return todos
    }
  }

  /**
   * Todoアイテムをフィルターして取得
   */
  getFilteredTodos(filterOption: FilterOption): TodoItem[] {
    switch (filterOption) {
      case 'overdue':
        return this.todos.filter(t => isOverdue(t.dueDate, t.completed))
      case 'today':
        return this.todos.filter(t => t.dueDate !== null && isToday(t.dueDate))
      case 'this-week':
        return this.todos.filter(t => t.dueDate !== null && isThisWeek(t.dueDate))
      case 'this-month':
        return this.todos.filter(t => t.dueDate !== null && isThisMonth(t.dueDate))
      case 'no-due-date':
        return this.todos.filter(t => t.dueDate === null)
      case 'all':
      default:
        return [...this.todos]
    }
  }
}
