import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TodoService } from './TodoService'
import { TodoRepository } from '../repositories/TodoRepository'
import type { TodoItem } from '../types/todo'

describe('TodoService', () => {
  let service: TodoService
  let repository: TodoRepository
  let mockTodos: TodoItem[]

  beforeEach(() => {
    // TodoRepositoryのモック
    repository = {
      saveTodos: vi.fn(),
      loadTodos: vi.fn(),
      clearTodos: vi.fn(),
      checkStorageAvailable: vi.fn(),
    } as any

    mockTodos = []
    service = new TodoService(repository)

    // loadTodosのデフォルトモック動作
    vi.mocked(repository.loadTodos).mockReturnValue({
      success: true,
      value: mockTodos,
    })

    // saveTodosのデフォルトモック動作
    vi.mocked(repository.saveTodos).mockReturnValue({
      success: true,
      value: undefined,
    })
  })

  describe('loadTodos', () => {
    it('Repositoryからデータを読み込める', () => {
      const storedTodos: TodoItem[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'テストタスク',
          completed: false,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: null,
        },
      ]
      vi.mocked(repository.loadTodos).mockReturnValue({
        success: true,
        value: storedTodos,
      })

      const result = service.loadTodos()

      expect(result.success).toBe(true)
      expect(repository.loadTodos).toHaveBeenCalled()
      expect(service.getAllTodos()).toEqual(storedTodos)
    })

    it('Repository読み込みエラーを伝播する', () => {
      vi.mocked(repository.loadTodos).mockReturnValue({
        success: false,
        error: {
          type: 'STORAGE_UNAVAILABLE',
          message: 'ストレージが利用できません',
        },
      })

      const result = service.loadTodos()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('STORAGE_UNAVAILABLE')
      }
    })
  })

  describe('createTodo', () => {
    it('有効なタイトルで新しいTodoアイテムを作成できる', () => {
      const result = service.createTodo('新しいタスク')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.title).toBe('新しいタスク')
        expect(result.value.completed).toBe(false)
        expect(result.value.completedAt).toBeNull()
        expect(result.value.id).toBeDefined()
        expect(result.value.createdAt).toBeDefined()
      }
      expect(repository.saveTodos).toHaveBeenCalled()
    })

    it('作成されたアイテムは一意のUUIDを持つ', () => {
      const result1 = service.createTodo('タスク1')
      const result2 = service.createTodo('タスク2')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      if (result1.success && result2.success) {
        expect(result1.value.id).not.toBe(result2.value.id)
      }
    })

    it('空のタイトルでINVALID_TITLEエラーを返す', () => {
      const result = service.createTodo('')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_TITLE')
        expect(result.error.message).toContain('タイトル')
      }
      expect(repository.saveTodos).not.toHaveBeenCalled()
    })

    it('空白のみのタイトルでINVALID_TITLEエラーを返す', () => {
      const result = service.createTodo('   ')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('INVALID_TITLE')
      }
    })

    it('Repository保存エラーをSTORAGE_ERRORとして返す', () => {
      vi.mocked(repository.saveTodos).mockReturnValue({
        success: false,
        error: {
          type: 'STORAGE_UNAVAILABLE',
          message: 'ストレージエラー',
        },
      })

      const result = service.createTodo('タスク')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('STORAGE_ERROR')
      }
    })

    it('作成したアイテムがgetAllTodosで取得できる', () => {
      service.createTodo('タスク1')
      service.createTodo('タスク2')

      const todos = service.getAllTodos()
      expect(todos.length).toBe(2)
      expect(todos[0].title).toBe('タスク1')
      expect(todos[1].title).toBe('タスク2')
    })
  })

  describe('getAllTodos', () => {
    it('空のリストを返せる', () => {
      const todos = service.getAllTodos()
      expect(todos).toEqual([])
    })

    it('すべてのTodoアイテムを返す', () => {
      service.createTodo('タスク1')
      service.createTodo('タスク2')
      service.createTodo('タスク3')

      const todos = service.getAllTodos()
      expect(todos.length).toBe(3)
    })
  })

  describe('getTodoById', () => {
    it('存在するIDでTodoアイテムを取得できる', () => {
      const createResult = service.createTodo('テストタスク')
      expect(createResult.success).toBe(true)

      if (createResult.success) {
        const todo = service.getTodoById(createResult.value.id)
        expect(todo).not.toBeNull()
        expect(todo?.title).toBe('テストタスク')
      }
    })

    it('存在しないIDでnullを返す', () => {
      const todo = service.getTodoById('non-existent-id')
      expect(todo).toBeNull()
    })
  })

  describe('deleteTodo', () => {
    it('存在するTodoアイテムを削除できる', () => {
      const createResult = service.createTodo('削除テスト')
      expect(createResult.success).toBe(true)

      if (createResult.success) {
        const deleteResult = service.deleteTodo(createResult.value.id)

        expect(deleteResult.success).toBe(true)
        expect(service.getTodoById(createResult.value.id)).toBeNull()
        expect(repository.saveTodos).toHaveBeenCalled()
      }
    })

    it('存在しないIDでTODO_NOT_FOUNDエラーを返す', () => {
      const result = service.deleteTodo('non-existent-id')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('TODO_NOT_FOUND')
        expect(result.error.message).toContain('見つかりません')
      }
    })

    it('Repository保存エラーをSTORAGE_ERRORとして返す', () => {
      const createResult = service.createTodo('タスク')
      expect(createResult.success).toBe(true)

      vi.mocked(repository.saveTodos).mockReturnValue({
        success: false,
        error: {
          type: 'STORAGE_UNAVAILABLE',
          message: 'ストレージエラー',
        },
      })

      if (createResult.success) {
        const result = service.deleteTodo(createResult.value.id)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.type).toBe('STORAGE_ERROR')
        }
      }
    })

    it('削除後、getAllTodosに含まれない', () => {
      service.createTodo('タスク1')
      const createResult = service.createTodo('タスク2')
      service.createTodo('タスク3')

      if (createResult.success) {
        service.deleteTodo(createResult.value.id)
      }

      const todos = service.getAllTodos()
      expect(todos.length).toBe(2)
      expect(todos.find(t => t.title === 'タスク2')).toBeUndefined()
    })
  })
})
