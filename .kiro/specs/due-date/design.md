# Design Document: due-date

## 概要

TODOアプリに期限日（due-date）機能を追加するための技術設計ドキュメント。既存のService/Repositoryパターンを維持しながら、後方互換性を保った形で実装する。

## アーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────────┐
│                  Components                      │
│  (TodoForm, TodoItem, TodoList, TodoFilter)     │
├─────────────────────────────────────────────────┤
│                   App.tsx                        │
│         (状態管理・イベントハンドリング)           │
├─────────────────────────────────────────────────┤
│                 TodoService                      │
│            (ビジネスロジック)                     │
├─────────────────────────────────────────────────┤
│               TodoRepository                     │
│          (LocalStorage永続化)                    │
├─────────────────────────────────────────────────┤
│                 Utils                            │
│            (dateUtils.ts)                        │
└─────────────────────────────────────────────────┘
```

## データモデル

### TodoItem型の拡張

```typescript
interface TodoItem {
  id: string
  title: string
  completed: boolean
  createdAt: string
  completedAt: string | null
  dueDate: string | null  // 追加: ISO 8601形式 (YYYY-MM-DD)
}
```

### 新規型定義

```typescript
// 期限更新エラー
interface UpdateDueDateError {
  type: 'INVALID_DUE_DATE' | 'TODO_NOT_FOUND' | 'STORAGE_ERROR'
  message: string
}

// 期限状態
type DueDateStatus = 'overdue' | 'due-soon' | 'on-time' | 'no-due-date'

// ソートオプション
type SortOption = 'created-asc' | 'created-desc' | 'due-date-asc' | 'due-date-desc'

// フィルターオプション
type FilterOption = 'all' | 'overdue' | 'today' | 'this-week' | 'this-month' | 'no-due-date'
```

## コンポーネント設計

### 新規コンポーネント

#### TodoFilter
- ソート選択（作成日/期限日、昇順/降順）
- フィルター選択（すべて/期限切れ/今日/今週/今月/期限なし）
- メモ化（React.memo）

### 変更コンポーネント

#### TodoForm
- `dueDate` state追加
- `<input type="date">` フィールド追加
- `onSubmit(title, dueDate)` シグネチャ変更

#### TodoItem
- 期限表示エリア追加
- インライン編集機能（isEditingDueDate state）
- 色分け表示（useMemoでdueDateStatus計算）
- `onUpdateDueDate` props追加

#### TodoList
- `onUpdateDueDate` props追加・伝播

#### App
- `sortOption`, `filterOption` state追加
- `handleUpdateDueDate` ハンドラー追加
- `displayTodos` メモ化（フィルター＋ソート適用）

## Service層設計

### TodoService拡張

```typescript
class TodoService {
  // 既存メソッド（変更）
  createTodo(title: string, dueDate?: string | null): Result<TodoItem, CreateTodoError>

  // 新規メソッド
  updateDueDate(id: string, dueDate: string | null): Result<TodoItem, UpdateDueDateError>
  getSortedTodos(sortOption: SortOption): TodoItem[]
  getFilteredTodos(filterOption: FilterOption): TodoItem[]
}
```

## Repository層設計

### 後方互換性

```typescript
loadTodos(): Result<TodoItem[], StorageError> {
  // パース後、dueDateフィールドがない既存データにnullを設定
  const rawTodos = JSON.parse(jsonString) as Partial<TodoItem>[]
  const todos = rawTodos.map(todo => ({
    ...todo,
    dueDate: todo.dueDate ?? null,
  }))
  return { success: true, value: todos }
}
```

## ユーティリティ設計

### dateUtils.ts

| 関数 | 説明 |
|------|------|
| `getDueDateStatus(dueDate, completed)` | 期限状態を判定 |
| `isValidDueDate(dateString)` | YYYY-MM-DD形式バリデーション |
| `formatDueDate(dueDate)` | 表示用フォーマット（日本語） |
| `isToday(dueDate)` | 今日判定 |
| `isThisWeek(dueDate)` | 今週判定（月〜日） |
| `isThisMonth(dueDate)` | 今月判定 |
| `isOverdue(dueDate, completed)` | 期限切れ判定 |

## UI/UX設計

### 色分けルール

| 状態 | スタイル |
|------|---------|
| 期限切れ（overdue） | 赤ボーダー + 薄赤背景 |
| 期限間近（due-soon） | 黄ボーダー + 薄黄背景 |
| 完了済み | 色分けなし |
| 期限なし | 色分けなし |

### CSSクラス

```css
.due-date-overdue { border-left: 4px solid #dc3545; background-color: #fff5f5; }
.due-date-soon { border-left: 4px solid #ffc107; background-color: #fffbeb; }
```

## テスト戦略

### ユニットテスト
- dateUtils: 各関数の正常系・異常系
- TodoService: 新規メソッド（updateDueDate, getSortedTodos, getFilteredTodos）

### コンポーネントテスト
- TodoForm: 日付入力・送信
- TodoItem: 期限表示・編集
- TodoFilter: ソート/フィルター選択

### 統合テスト
- App: フルフロー（作成→表示→編集→ソート→フィルター）

## パフォーマンス考慮

1. **メモ化**: `useMemo` でdueDateStatusとdisplayTodosを計算
2. **React.memo**: TodoFilter, TodoItemComponentをメモ化
3. **遅延計算**: フィルター/ソートはレンダリング時のみ実行

## ファイル構成

```
src/
├── types/todo.ts          # 型定義拡張
├── utils/
│   ├── dateUtils.ts       # 日付ユーティリティ（新規）
│   └── dateUtils.test.ts  # テスト（新規）
├── services/
│   └── TodoService.ts     # Service拡張
├── repositories/
│   └── TodoRepository.ts  # 後方互換性対応
├── components/
│   ├── TodoForm.tsx       # 日付入力追加
│   ├── TodoItem.tsx       # 期限表示・編集
│   ├── TodoList.tsx       # props追加
│   └── TodoFilter.tsx     # ソート/フィルター（新規）
├── App.tsx                # 状態管理統合
└── App.css                # スタイル追加
```
