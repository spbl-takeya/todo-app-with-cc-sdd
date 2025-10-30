import { describe, it, expect } from 'vitest'
import type { TodoItem, Result, CreateTodoError, ToggleTodoError, DeleteTodoError, StorageError } from './todo'

describe('TodoItem型の定義', () => {
  it('TodoItem型が正しい構造を持つ', () => {
    const todoItem: TodoItem = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'テストタスク',
      completed: false,
      createdAt: '2025-10-30T12:00:00.000Z',
      completedAt: null,
    }

    expect(todoItem.id).toBeDefined()
    expect(todoItem.title).toBeDefined()
    expect(todoItem.completed).toBeDefined()
    expect(todoItem.createdAt).toBeDefined()
    expect(todoItem.completedAt).toBeNull()
  })

  it('完了したTodoItemはcompletedAtを持つ', () => {
    const completedTodoItem: TodoItem = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: '完了タスク',
      completed: true,
      createdAt: '2025-10-30T12:00:00.000Z',
      completedAt: '2025-10-30T13:00:00.000Z',
    }

    expect(completedTodoItem.completed).toBe(true)
    expect(completedTodoItem.completedAt).not.toBeNull()
  })
})

describe('Result型の定義', () => {
  it('成功時のResult型が正しい構造を持つ', () => {
    const successResult: Result<string, Error> = {
      success: true,
      value: 'test value',
    }

    expect(successResult.success).toBe(true)
    expect(successResult.value).toBe('test value')
  })

  it('失敗時のResult型が正しい構造を持つ', () => {
    const errorResult: Result<string, Error> = {
      success: false,
      error: new Error('test error'),
    }

    expect(errorResult.success).toBe(false)
    expect(errorResult.error).toBeInstanceOf(Error)
  })
})

describe('エラー型の定義', () => {
  it('CreateTodoError型が正しい構造を持つ', () => {
    const createError: CreateTodoError = {
      type: 'INVALID_TITLE',
      message: 'タイトルが空です',
    }

    expect(createError.type).toBe('INVALID_TITLE')
    expect(createError.message).toBeDefined()
  })

  it('ToggleTodoError型が正しい構造を持つ', () => {
    const toggleError: ToggleTodoError = {
      type: 'TODO_NOT_FOUND',
      message: 'TODOが見つかりません',
    }

    expect(toggleError.type).toBe('TODO_NOT_FOUND')
    expect(toggleError.message).toBeDefined()
  })

  it('DeleteTodoError型が正しい構造を持つ', () => {
    const deleteError: DeleteTodoError = {
      type: 'TODO_NOT_FOUND',
      message: 'TODOが見つかりません',
    }

    expect(deleteError.type).toBe('TODO_NOT_FOUND')
    expect(deleteError.message).toBeDefined()
  })

  it('StorageError型が正しい構造を持つ', () => {
    const storageError: StorageError = {
      type: 'STORAGE_UNAVAILABLE',
      message: 'ストレージが利用できません',
    }

    expect(storageError.type).toBe('STORAGE_UNAVAILABLE')
    expect(storageError.message).toBeDefined()
  })
})
