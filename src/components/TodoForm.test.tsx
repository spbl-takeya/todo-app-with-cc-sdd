import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TodoForm } from './TodoForm'

describe('TodoForm', () => {
  it('入力フィールドとボタンを表示する', () => {
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    expect(screen.getByPlaceholderText('新しいTODOを入力...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('テキストを入力できる', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, 'テストTODO')

    expect(input).toHaveValue('テストTODO')
  })

  it('空のタイトルで送信するとバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const button = screen.getByRole('button', { name: '追加' })
    await user.click(button)

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('空白のみのタイトルで送信するとバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, '   ')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('有効なタイトルで送信するとonSubmitが呼ばれる', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, 'テストTODO')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(mockOnSubmit).toHaveBeenCalledWith('テストTODO', null)
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('前後の空白をトリムして送信する', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, '  テストTODO  ')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(mockOnSubmit).toHaveBeenCalledWith('テストTODO', null)
  })

  it('送信成功後に入力フィールドがクリアされる', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, 'テストTODO')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(input).toHaveValue('')
  })

  it('送信成功後にバリデーションエラーがクリアされる', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    // まずエラーを表示させる
    const button = screen.getByRole('button', { name: '追加' })
    await user.click(button)
    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument()

    // 有効な入力で送信
    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, 'テストTODO')
    await user.click(button)

    expect(screen.queryByText('タイトルを入力してください')).not.toBeInTheDocument()
  })
})
