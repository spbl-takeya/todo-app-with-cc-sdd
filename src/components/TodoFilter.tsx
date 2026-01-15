import { memo } from 'react'
import type { SortOption, FilterOption } from '../types/todo'

interface TodoFilterProps {
  sortOption: SortOption
  filterOption: FilterOption
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filter: FilterOption) => void
}

export const TodoFilter = memo(function TodoFilter({
  sortOption,
  filterOption,
  onSortChange,
  onFilterChange,
}: TodoFilterProps) {
  return (
    <div className="todo-filter">
      <div className="filter-group">
        <label htmlFor="sort-select">ソート:</label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="created-desc">作成日（新しい順）</option>
          <option value="created-asc">作成日（古い順）</option>
          <option value="due-date-asc">期限（近い順）</option>
          <option value="due-date-desc">期限（遠い順）</option>
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="filter-select">フィルター:</label>
        <select
          id="filter-select"
          value={filterOption}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
        >
          <option value="all">すべて</option>
          <option value="overdue">期限切れ</option>
          <option value="today">今日</option>
          <option value="this-week">今週</option>
          <option value="this-month">今月</option>
          <option value="no-due-date">期限なし</option>
        </select>
      </div>
    </div>
  )
})
