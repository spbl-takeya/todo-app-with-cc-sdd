import type { TodoItem } from '../types/todo'

interface TodoItemProps {
  todo: TodoItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItemComponent({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <span
        className="todo-title"
        style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
      >
        {todo.title}
      </span>
      <div className="todo-actions">
        <button
          onClick={() => onToggle(todo.id)}
          className="toggle-button"
        >
          {todo.completed ? '未完了に戻す' : '完了'}
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="delete-button"
        >
          削除
        </button>
      </div>
    </li>
  )
}
