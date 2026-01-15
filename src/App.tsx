import { useState, useEffect, useCallback, useMemo } from 'react'
import type { TodoItem, SortOption, FilterOption } from './types/todo'
import { TodoService } from './services/TodoService'
import { TodoRepository } from './repositories/TodoRepository'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { TodoFilter } from './components/TodoFilter'
import { ErrorMessage } from './components/ErrorMessage'
import './App.css'

// ServiceとRepositoryのシングルトンインスタンス
const repository = new TodoRepository()
const todoService = new TodoService(repository)

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('created-desc')
  const [filterOption, setFilterOption] = useState<FilterOption>('all')

  // 初期データ読み込み
  useEffect(() => {
    const loadResult = todoService.loadTodos()
    if (loadResult.success) {
      setTodos(todoService.getAllTodos())
    } else {
      setError(`データの読み込みに失敗しました: ${loadResult.error.message}`)
    }
  }, [])

  // TODOアイテム作成
  const handleCreate = useCallback((title: string, dueDate: string | null) => {
    const result = todoService.createTodo(title, dueDate)
    if (result.success) {
      setTodos(todoService.getAllTodos())
      setError(null)
    } else {
      setError(result.error.message)
    }
  }, [])

  // 完了状態切り替え
  const handleToggle = useCallback((id: string) => {
    const result = todoService.toggleTodo(id)
    if (result.success) {
      setTodos(todoService.getAllTodos())
      setError(null)
    } else {
      setError(result.error.message)
    }
  }, [])

  // 削除
  const handleDelete = useCallback((id: string) => {
    const result = todoService.deleteTodo(id)
    if (result.success) {
      setTodos(todoService.getAllTodos())
      setError(null)
    } else {
      setError(result.error.message)
    }
  }, [])

  // 期限更新
  const handleUpdateDueDate = useCallback((id: string, dueDate: string | null) => {
    const result = todoService.updateDueDate(id, dueDate)
    if (result.success) {
      setTodos(todoService.getAllTodos())
      setError(null)
    } else {
      setError(result.error.message)
    }
  }, [])

  // 表示用Todoリスト（フィルター＋ソート適用）
  const displayTodos = useMemo(() => {
    const filtered = todoService.getFilteredTodos(filterOption)
    const filteredIds = new Set(filtered.map(t => t.id))
    const sorted = todoService.getSortedTodos(sortOption)
    return sorted.filter(t => filteredIds.has(t.id))
  }, [todos, sortOption, filterOption])

  return (
    <div className="app">
      <h1>TODO App</h1>
      <p>TODOアプリケーション - cc-sddで構築</p>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <TodoForm onSubmit={handleCreate} />
      <TodoFilter
        sortOption={sortOption}
        filterOption={filterOption}
        onSortChange={setSortOption}
        onFilterChange={setFilterOption}
      />
      <TodoList
        todos={displayTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onUpdateDueDate={handleUpdateDueDate}
      />
    </div>
  )
}

export default App
