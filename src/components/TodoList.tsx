import type { TodoItem } from '../types/todo'
import { TodoItemComponent } from './TodoItem'

interface TodoListProps {
  todos: TodoItem[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-message">TODOアイテムがありません</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItemComponent
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
