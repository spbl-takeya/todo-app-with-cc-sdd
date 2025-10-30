import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TodoItemComponent } from './TodoItem'
import type { TodoItem } from '../types/todo'

describe('TodoItem', () => {
  const mockTodo: TodoItem = {
    id: 'test-id-1',
    title: 'テストTODO',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    completedAt: null,
  }

  it('未完了のTODOアイテムを表示する', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByText('テストTODO')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '完了' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('完了済みのTODOアイテムを表示する', () => {
    const completedTodo: TodoItem = {
      ...mockTodo,
      completed: true,
      completedAt: '2024-01-01T12:00:00.000Z',
    }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(screen.getByText('テストTODO')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '未完了に戻す' })).toBeInTheDocument()
  })

  it('未完了のTODOアイテムには打ち消し線がない', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const title = screen.getByText('テストTODO')
    expect(title).toHaveStyle({ textDecoration: 'none' })
  })

  it('完了済みのTODOアイテムには打ち消し線がある', () => {
    const completedTodo: TodoItem = {
      ...mockTodo,
      completed: true,
      completedAt: '2024-01-01T12:00:00.000Z',
    }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const title = screen.getByText('テストTODO')
    expect(title).toHaveStyle({ textDecoration: 'line-through' })
  })

  it('完了ボタンをクリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup()
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const toggleButton = screen.getByRole('button', { name: '完了' })
    await user.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalledWith('test-id-1')
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('未完了に戻すボタンをクリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup()
    const completedTodo: TodoItem = {
      ...mockTodo,
      completed: true,
      completedAt: '2024-01-01T12:00:00.000Z',
    }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const toggleButton = screen.getByRole('button', { name: '未完了に戻す' })
    await user.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalledWith('test-id-1')
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
    const user = userEvent.setup()
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: '削除' })
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('test-id-1')
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('完了済みアイテムのcompletedクラスが適用される', () => {
    const completedTodo: TodoItem = {
      ...mockTodo,
      completed: true,
      completedAt: '2024-01-01T12:00:00.000Z',
    }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    const { container } = render(
      <TodoItemComponent todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    )

    const listItem = container.querySelector('.todo-item')
    expect(listItem).toHaveClass('completed')
  })

  it('未完了アイテムにはcompletedクラスが適用されない', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    const { container } = render(
      <TodoItemComponent todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    )

    const listItem = container.querySelector('.todo-item')
    expect(listItem).not.toHaveClass('completed')
  })

  it('長いタイトルを正しく表示する', () => {
    const longTitleTodo: TodoItem = {
      ...mockTodo,
      title: 'これは非常に長いタイトルのテストです。この長いタイトルが正しく表示されることを確認します。',
    }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    render(<TodoItemComponent todo={longTitleTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

    expect(
      screen.getByText(
        'これは非常に長いタイトルのテストです。この長いタイトルが正しく表示されることを確認します。'
      )
    ).toBeInTheDocument()
  })
})
