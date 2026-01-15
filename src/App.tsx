import { useState, useEffect, useCallback } from 'react'
import type { TodoItem } from './types/todo'
import { TodoService } from './services/TodoService'
import { TodoRepository } from './repositories/TodoRepository'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { ErrorMessage } from './components/ErrorMessage'
import './App.css'

// ServiceとRepositoryのシングルトンインスタンス
const repository = new TodoRepository()
const todoService = new TodoService(repository)

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [error, setError] = useState<string | null>(null)

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
  const handleCreate = useCallback((title: string) => {
    const result = todoService.createTodo(title)
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

  return (
    <div className="app">
      <h1>TODO App</h1>
      <p>TODOアプリケーション - cc-sddで構築</p>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <TodoForm onSubmit={handleCreate} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  )
}

export default App
