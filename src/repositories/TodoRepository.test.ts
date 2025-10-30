import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TodoRepository } from './TodoRepository'
import type { TodoItem } from '../types/todo'

describe('TodoRepository', () => {
  let repository: TodoRepository
  let localStorageMock: { [key: string]: string }

  beforeEach(() => {
    // LocalStorageのモック実装
    localStorageMock = {}

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
      get length() {
        return Object.keys(localStorageMock).length
      },
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
    } as Storage

    repository = new TodoRepository()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('checkStorageAvailable', () => {
    it('LocalStorageが利用可能な場合、trueを返す', () => {
      const result = repository.checkStorageAvailable()
      expect(result).toBe(true)
    })

    it('LocalStorageが利用不可の場合、falseを返す', () => {
      // LocalStorageを無効化
      global.localStorage = undefined as any
      repository = new TodoRepository()

      const result = repository.checkStorageAvailable()
      expect(result).toBe(false)
    })
  })

  describe('saveTodos', () => {
    it('空のTodoリストを正しく保存できる', () => {
      const todos: TodoItem[] = []
      const result = repository.saveTodos(todos)

      expect(result.success).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('todos', '[]')
    })

    it('単一のTodoアイテムを正しく保存できる', () => {
      const todos: TodoItem[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'テストタスク',
          completed: false,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: null,
        },
      ]
      const result = repository.saveTodos(todos)

      expect(result.success).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(todos))
    })

    it('複数のTodoアイテムを正しく保存できる', () => {
      const todos: TodoItem[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'タスク1',
          completed: false,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: null,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'タスク2',
          completed: true,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: '2025-10-30T13:00:00.000Z',
        },
      ]
      const result = repository.saveTodos(todos)

      expect(result.success).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(todos))
    })

    it('LocalStorageが利用不可の場合、STORAGE_UNAVAILABLEエラーを返す', () => {
      global.localStorage = undefined as any
      repository = new TodoRepository()

      const todos: TodoItem[] = []
      const result = repository.saveTodos(todos)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('STORAGE_UNAVAILABLE')
        expect(result.error.message).toContain('利用できません')
      }
    })
  })

  describe('loadTodos', () => {
    it('保存されたTodoリストを正しく読み込める', () => {
      const todos: TodoItem[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'テストタスク',
          completed: false,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: null,
        },
      ]
      localStorageMock['todos'] = JSON.stringify(todos)

      const result = repository.loadTodos()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual(todos)
      }
    })

    it('LocalStorageが空の場合、空配列を返す', () => {
      const result = repository.loadTodos()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual([])
      }
    })

    it('複数のTodoアイテムを正しく読み込める', () => {
      const todos: TodoItem[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'タスク1',
          completed: false,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: null,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'タスク2',
          completed: true,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: '2025-10-30T13:00:00.000Z',
        },
      ]
      localStorageMock['todos'] = JSON.stringify(todos)

      const result = repository.loadTodos()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual(todos)
        expect(result.value.length).toBe(2)
      }
    })

    it('LocalStorageが利用不可の場合、STORAGE_UNAVAILABLEエラーを返す', () => {
      global.localStorage = undefined as any
      repository = new TodoRepository()

      const result = repository.loadTodos()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('STORAGE_UNAVAILABLE')
        expect(result.error.message).toContain('利用できません')
      }
    })

    it('JSONパースエラーの場合、PARSE_ERRORを返す', () => {
      localStorageMock['todos'] = 'invalid json {'

      const result = repository.loadTodos()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('PARSE_ERROR')
        expect(result.error.message).toContain('パース')
      }
    })
  })

  describe('clearTodos', () => {
    it('LocalStorageのTodoデータをクリアできる', () => {
      localStorageMock['todos'] = JSON.stringify([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'テストタスク',
          completed: false,
          createdAt: '2025-10-30T12:00:00.000Z',
          completedAt: null,
        },
      ])

      const result = repository.clearTodos()

      expect(result.success).toBe(true)
      expect(localStorage.removeItem).toHaveBeenCalledWith('todos')
    })

    it('LocalStorageが利用不可の場合、STORAGE_UNAVAILABLEエラーを返す', () => {
      global.localStorage = undefined as any
      repository = new TodoRepository()

      const result = repository.clearTodos()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('STORAGE_UNAVAILABLE')
        expect(result.error.message).toContain('利用できません')
      }
    })
  })
})
