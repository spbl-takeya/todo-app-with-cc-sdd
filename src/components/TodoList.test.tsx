import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TodoList } from './TodoList'
import type { TodoItem } from '../types/todo'

describe('TodoList', () => {
  it('空のリストの場合、空メッセージを表示する', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByText('TODOアイテムがありません')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('TODOアイテムがある場合、リストを表示する', () => {
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: 'テストTODO 1',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
      {
        id: 'test-id-2',
        title: 'テストTODO 2',
        completed: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-01T12:00:00.000Z',
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('テストTODO 1')).toBeInTheDocument()
    expect(screen.getByText('テストTODO 2')).toBeInTheDocument()
    expect(screen.queryByText('TODOアイテムがありません')).not.toBeInTheDocument()
  })

  it('複数のTODOアイテムをすべて表示する', () => {
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: 'TODOアイテム1',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
      {
        id: 'test-id-2',
        title: 'TODOアイテム2',
        completed: false,
        createdAt: '2024-01-01T01:00:00.000Z',
        completedAt: null,
      },
      {
        id: 'test-id-3',
        title: 'TODOアイテム3',
        completed: true,
        createdAt: '2024-01-01T02:00:00.000Z',
        completedAt: '2024-01-01T03:00:00.000Z',
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByText('TODOアイテム1')).toBeInTheDocument()
    expect(screen.getByText('TODOアイテム2')).toBeInTheDocument()
    expect(screen.getByText('TODOアイテム3')).toBeInTheDocument()
  })

  it('各アイテムにユニークなkeyが設定されている', () => {
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: 'テストTODO 1',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
      {
        id: 'test-id-2',
        title: 'テストTODO 2',
        completed: false,
        createdAt: '2024-01-01T01:00:00.000Z',
        completedAt: null,
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    const { container } = render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const listItems = container.querySelectorAll('.todo-item')
    expect(listItems).toHaveLength(2)
  })

  it('アイテムの完了ボタンをクリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup()
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: 'テストTODO',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const toggleButton = screen.getByRole('button', { name: '完了' })
    await user.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalledWith('test-id-1')
  })

  it('アイテムの削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
    const user = userEvent.setup()
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: 'テストTODO',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: '削除' })
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('test-id-1')
  })

  it('1つのアイテムだけの場合も正しく表示する', () => {
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: '唯一のTODO',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('唯一のTODO')).toBeInTheDocument()
  })

  it('完了済みと未完了が混在するリストを正しく表示する', () => {
    const todos: TodoItem[] = [
      {
        id: 'test-id-1',
        title: '未完了TODO',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
      {
        id: 'test-id-2',
        title: '完了済みTODO',
        completed: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-01T12:00:00.000Z',
      },
    ]
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByText('未完了TODO')).toBeInTheDocument()
    expect(screen.getByText('完了済みTODO')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '完了' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '未完了に戻す' })).toBeInTheDocument()
  })
})
