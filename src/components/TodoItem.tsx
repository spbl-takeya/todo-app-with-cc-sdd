import { memo, useState, useMemo } from 'react'
import type { TodoItem } from '../types/todo'
import { getDueDateStatus, formatDueDate } from '../utils/dateUtils'

interface TodoItemProps {
  todo: TodoItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdateDueDate: (id: string, dueDate: string | null) => void
}

export const TodoItemComponent = memo(function TodoItemComponent({
  todo,
  onToggle,
  onDelete,
  onUpdateDueDate,
}: TodoItemProps) {
  const [isEditingDueDate, setIsEditingDueDate] = useState(false)
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '')

  const dueDateStatus = useMemo(
    () => getDueDateStatus(todo.dueDate, todo.completed),
    [todo.dueDate, todo.completed]
  )

  const dueDateClassName = useMemo(() => {
    if (todo.completed) return ''
    switch (dueDateStatus) {
      case 'overdue':
        return 'due-date-overdue'
      case 'due-soon':
        return 'due-date-soon'
      default:
        return ''
    }
  }, [dueDateStatus, todo.completed])

  const handleDueDateSave = () => {
    onUpdateDueDate(todo.id, editDueDate || null)
    setIsEditingDueDate(false)
  }

  const handleDueDateCancel = () => {
    setEditDueDate(todo.dueDate || '')
    setIsEditingDueDate(false)
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''} ${dueDateClassName}`}>
      <div className="todo-content">
        <span
          className="todo-title"
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        >
          {todo.title}
        </span>
        <div className="todo-due-date">
          {isEditingDueDate ? (
            <>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="due-date-input"
              />
              <button onClick={handleDueDateSave} className="save-date-button">
                保存
              </button>
              <button onClick={handleDueDateCancel} className="cancel-button">
                キャンセル
              </button>
            </>
          ) : (
            <>
              <span className="due-date-display">{formatDueDate(todo.dueDate)}</span>
              <button onClick={() => setIsEditingDueDate(true)} className="edit-date-button">
                期限編集
              </button>
            </>
          )}
        </div>
      </div>
      <div className="todo-actions">
        <button onClick={() => onToggle(todo.id)} className="toggle-button">
          {todo.completed ? '未完了に戻す' : '完了'}
        </button>
        <button onClick={() => onDelete(todo.id)} className="delete-button">
          削除
        </button>
      </div>
    </li>
  )
})
