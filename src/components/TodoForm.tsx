import { useState, FormEvent } from 'react'

interface TodoFormProps {
  onSubmit: (title: string) => void
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (title.trim() === '') {
      setValidationError('タイトルを入力してください')
      return
    }

    onSubmit(title.trim())
    setTitle('')
    setValidationError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいTODOを入力..."
        className="todo-input"
      />
      <button type="submit" className="todo-button">
        追加
      </button>
      {validationError && <span className="error-text">{validationError}</span>}
    </form>
  )
}
