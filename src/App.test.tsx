import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from './App'

describe('App - E2E Integration Tests', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear()
    // crypto.randomUUIDをモック化して予測可能なIDを生成
    let counter = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      counter++
      return `test-uuid-${counter}`
    })
  })

  it('初期状態で空のTODOリストを表示する', () => {
    render(<App />)

    expect(screen.getByText('TODO App')).toBeInTheDocument()
    expect(screen.getByText('TODOアイテムがありません')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('新しいTODOを入力...')).toBeInTheDocument()
  })

  it('フルフロー: アイテム作成 → 表示 → 完了 → 削除', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 1. アイテム作成
    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, '牛乳を買う')
    await user.click(screen.getByRole('button', { name: '追加' }))

    // 2. 表示確認
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    expect(screen.queryByText('TODOアイテムがありません')).not.toBeInTheDocument()

    // 3. 完了
    await user.click(screen.getByRole('button', { name: '完了' }))
    expect(screen.getByRole('button', { name: '未完了に戻す' })).toBeInTheDocument()
    const title = screen.getByText('牛乳を買う')
    expect(title).toHaveStyle({ textDecoration: 'line-through' })

    // 4. 削除
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(screen.queryByText('牛乳を買う')).not.toBeInTheDocument()
    expect(screen.getByText('TODOアイテムがありません')).toBeInTheDocument()
  })

  it('複数のアイテムを作成・管理できる', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')

    // 3つのアイテムを作成
    await user.type(input, 'タスク1')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await user.type(input, 'タスク2')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await user.type(input, 'タスク3')
    await user.click(screen.getByRole('button', { name: '追加' }))

    // すべて表示されることを確認
    expect(screen.getByText('タスク1')).toBeInTheDocument()
    expect(screen.getByText('タスク2')).toBeInTheDocument()
    expect(screen.getByText('タスク3')).toBeInTheDocument()

    // 真ん中のタスクを完了
    const toggleButtons = screen.getAllByRole('button', { name: '完了' })
    await user.click(toggleButtons[1]) // タスク2

    // タスク2が完了状態になることを確認
    const task2 = screen.getByText('タスク2')
    expect(task2).toHaveStyle({ textDecoration: 'line-through' })
  })

  it('完了したアイテムを未完了に戻せる', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, '読書する')
    await user.click(screen.getByRole('button', { name: '追加' }))

    // 完了にする
    await user.click(screen.getByRole('button', { name: '完了' }))
    const titleCompleted = screen.getByText('読書する')
    expect(titleCompleted).toHaveStyle({ textDecoration: 'line-through' })

    // 未完了に戻す
    await user.click(screen.getByRole('button', { name: '未完了に戻す' }))
    const titleUncompleted = screen.getByText('読書する')
    expect(titleUncompleted).toHaveStyle({ textDecoration: 'none' })
    expect(screen.getByRole('button', { name: '完了' })).toBeInTheDocument()
  })

  it('空のタイトルでアイテムを作成できない', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 空のまま送信
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getByText('タイトルを入力してください')).toBeInTheDocument()
    expect(screen.getByText('TODOアイテムがありません')).toBeInTheDocument()
  })

  it('LocalStorageへのデータ永続化', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    // アイテムを作成
    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, '永続化テスト')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getByText('永続化テスト')).toBeInTheDocument()

    // LocalStorageに保存されていることを確認
    const savedData = localStorage.getItem('todos')
    expect(savedData).toBeTruthy()
    const todos = JSON.parse(savedData!)
    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe('永続化テスト')

    unmount()
  })

  it('LocalStorageからのデータ復元', async () => {
    // 事前にLocalStorageにデータを設定
    const mockTodos = [
      {
        id: 'existing-id-1',
        title: '既存のTODO',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      },
      {
        id: 'existing-id-2',
        title: '完了済みTODO',
        completed: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-01T12:00:00.000Z',
      },
    ]
    localStorage.setItem('todos', JSON.stringify(mockTodos))

    render(<App />)

    // 復元されたデータが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('既存のTODO')).toBeInTheDocument()
      expect(screen.getByText('完了済みTODO')).toBeInTheDocument()
    })

    // 完了状態も復元されていることを確認
    const completedTitle = screen.getByText('完了済みTODO')
    expect(completedTitle).toHaveStyle({ textDecoration: 'line-through' })
  })

  it('ストレージエラー時にエラーメッセージを表示する', async () => {
    // LocalStorageをモック化してエラーを発生させる
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError')
    })

    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, 'エラーテスト')
    await user.click(screen.getByRole('button', { name: '追加' }))

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/データの保存に失敗しました/)).toBeInTheDocument()
    })

    // 元に戻す
    Storage.prototype.setItem = originalSetItem
  })

  it('エラーメッセージを閉じることができる', async () => {
    // ストレージエラーを発生させる
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError')
    })

    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')
    await user.type(input, 'エラーテスト')
    await user.click(screen.getByRole('button', { name: '追加' }))

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/データの保存に失敗しました/)).toBeInTheDocument()
    })

    // 閉じるボタンをクリック
    const closeButton = screen.getByRole('button', { name: '×' })
    await user.click(closeButton)

    // エラーメッセージが消えることを確認
    expect(screen.queryByText(/データの保存に失敗しました/)).not.toBeInTheDocument()

    // 元に戻す
    Storage.prototype.setItem = originalSetItem
  })

  it('連続してアイテムを作成できる', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('新しいTODOを入力...')

    // 1つ目
    await user.type(input, 'アイテム1')
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(screen.getByText('アイテム1')).toBeInTheDocument()

    // 2つ目（入力がクリアされることを確認）
    expect(input).toHaveValue('')
    await user.type(input, 'アイテム2')
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(screen.getByText('アイテム2')).toBeInTheDocument()

    // 3つ目
    expect(input).toHaveValue('')
    await user.type(input, 'アイテム3')
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(screen.getByText('アイテム3')).toBeInTheDocument()

    // すべて表示されていることを確認
    expect(screen.getByText('アイテム1')).toBeInTheDocument()
    expect(screen.getByText('アイテム2')).toBeInTheDocument()
    expect(screen.getByText('アイテム3')).toBeInTheDocument()
  })
})
