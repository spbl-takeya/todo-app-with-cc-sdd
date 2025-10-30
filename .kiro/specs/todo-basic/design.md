# 技術設計ドキュメント

## Overview

**目的**: このTODOアプリは、ユーザーがタスクを効率的に作成・管理・追跡できる基本的なタスク管理機能を提供します。

**ユーザー**: エンドユーザーは、日々のタスクを記録し、完了状態を管理し、不要なタスクを削除することができます。

**影響**: 新規アプリケーションとして、ブラウザベースのシンプルなTODOリストアプリを実装します。

### Goals

- ユーザーがタスクを直感的に作成・表示・管理できるシンプルなUI
- ブラウザを閉じてもデータが永続化されるローカルストレージベースのデータ管理
- タスクの完了状態を明確に視覚化し、進捗を追跡可能にする
- レスポンシブで軽量なフロントエンドアプリケーション

### Non-Goals

- ユーザー認証・マルチユーザー対応（シングルユーザーローカルアプリ）
- クラウド同期・バックエンドAPI連携
- 高度な機能（タスクの優先度、カテゴリ、期限、リマインダー）
- モバイルアプリ（ブラウザベースのみ）

## Architecture

### High-Level Architecture

```mermaid
graph TB
    UI[UIコンポーネント層]
    Service[サービス層]
    Storage[ストレージ層]

    UI --> Service
    Service --> Storage
    Storage --> LocalStorage[ブラウザLocalStorage]
```

このアプリケーションは、シンプルな3層アーキテクチャを採用します：

- **UIコンポーネント層**: ユーザーインターフェースの描画とイベント処理
- **サービス層**: ビジネスロジックとデータ操作
- **ストレージ層**: ブラウザのLocalStorageへのデータ永続化

### Technology Stack and Design Decisions

#### Frontend
- **選択**: React 19 + TypeScript + CSS3
- **理由**:
  - 宣言的UIで状態管理が直感的
  - コンポーネント再利用性が高く、保守性に優れる
  - TypeScriptによる型安全性で開発時のエラー削減
  - 広く採用されており、エコシステムが充実
  - React 19の最新機能（Compiler、Actions、useOptimistic等）が利用可能
- **代替案**: Vanilla JavaScript（大規模化時の状態管理が複雑）、Vue.js（Reactとの親和性確認済み）

#### Data Storage
- **選択**: Browser LocalStorage API
- **理由**:
  - 要件で指定されたローカルデータ永続化に最適
  - シンプルなkey-value APIで実装が容易
  - すべてのモダンブラウザでサポート
- **代替案**: IndexedDB（より複雑な構造化データ向け、今回は不要）

#### Architecture Pattern
- **選択**: Container/Presentational + Repository パターン
- **理由**:
  - Reactの状態管理とロジック/UIの分離に適合
  - Container（ロジック）とPresentational（表示）の責務が明確
  - Repositoryパターンでデータアクセス層を抽象化
  - Reactのベストプラクティスに沿った設計
- **代替案**: Redux/Context API（今回の規模では過剰）、Fluxパターン（複雑性が高い）

### Key Design Decisions

#### Decision 1: React宣言的UI + Hooks状態管理

**Decision**: ReactのuseStateとuseEffectを使用した宣言的UI構築

**Context**: TODOアイテムのリストは動的に変化し、リアルタイムなUI更新が必要。加えて、LocalStorageとの同期も必要

**Alternatives**:
- クラスコンポーネント: 古い記法で冗長
- Redux/Context API: 小規模アプリには過剰
- Vanilla JavaScript: 状態管理が複雑化

**Selected Approach**:
- useStateでTODOリストの状態を管理
- useEffectでLocalStorageとの同期（初期読み込み・自動保存）
- Reactの仮想DOMで効率的なUI更新
- 関数コンポーネントでシンプルな実装

**Rationale**:
- Reactの宣言的UIで状態とUIの同期が自動
- useEffectでデータ永続化のロジックを分離
- 関数コンポーネントはシンプルで理解しやすい
- TypeScriptとの相性が良い

**Trade-offs**:
- 獲得: 状態管理の簡潔さ、保守性、型安全性
- 犠牲: Reactの依存関係追加、ビルドステップ必要

#### Decision 2: 同期的なLocalStorage操作

**Decision**: すべてのデータ操作を同期的に実行し、即座にLocalStorageに反映

**Context**: ユーザーのアクション（作成・完了・削除）は即座にデータに反映される必要がある

**Alternatives**:
- バッチ更新: 一定間隔でまとめて保存
- 非同期キュー: Promise/async-awaitで保存

**Selected Approach**:
- アクション発生時に即座にLocalStorage.setItem()を呼び出し
- エラー処理でユーザーに即座にフィードバック

**Rationale**:
- LocalStorageは同期APIであり、パフォーマンス十分
- データ損失リスクを最小化
- 実装がシンプル

**Trade-offs**:
- 獲得: データ一貫性、シンプルなエラー処理
- 犠牲: 頻繁な書き込み時の若干のパフォーマンス低下（実用上問題なし）

#### Decision 3: UUIDベースのアイテム識別

**Decision**: 各TODOアイテムにUUID v4を使用

**Context**: アイテムを一意に識別し、削除・更新操作を正確に実行する必要がある

**Alternatives**:
- 連番ID: シンプルだが削除時に再採番が必要
- タイムスタンプ: 衝突の可能性
- 配列インデックス: 削除時に不安定

**Selected Approach**:
- crypto.randomUUID()でUUID v4を生成
- アイテムの一意キーとして使用

**Rationale**:
- 衝突リスクがゼロに近い
- ブラウザネイティブAPI（polyfill不要）
- 削除・並び替えに強い

**Trade-offs**:
- 獲得: 安定した識別子、拡張性
- 犠牲: わずかにメモリ使用量増加（実用上無視可能）

## System Flows

### TODOアイテム作成フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as App Component
    participant Service as TodoService
    participant Repo as TodoRepository
    participant LS as LocalStorage

    User->>App: タイトル入力 & 作成ボタンクリック
    App->>App: バリデーション（空チェック）
    alt 入力が空
        App->>User: エラー状態表示
    else 入力が有効
        App->>Service: createTodo(title)
        Service->>Service: TodoItemオブジェクト生成<br/>(UUID, title, completed:false, createdAt)
        Service->>Repo: saveTodos(todos)
        Repo->>LS: setItem('todos', JSON.stringify(todos))
        alt 保存成功
            LS-->>Repo: 成功
            Repo-->>Service: 成功
            Service-->>App: 新しいTodoItem
            App->>App: useState更新（自動再レンダリング）
            App->>User: 新アイテム表示
        else 保存失敗
            LS-->>Repo: エラー
            Repo-->>Service: エラー
            Service-->>App: エラー
            App->>User: エラー状態表示
        end
    end
```

### TODOアイテム完了トグルフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as App Component
    participant Service as TodoService
    participant Repo as TodoRepository
    participant LS as LocalStorage

    User->>App: 完了ボタンクリック
    App->>Service: toggleTodo(id)
    Service->>Service: アイテム検索(id)
    Service->>Service: completed状態反転
    Service->>Service: completedAt更新
    Service->>Repo: saveTodos(todos)
    Repo->>LS: setItem('todos', JSON.stringify(todos))
    LS-->>Repo: 成功
    Repo-->>Service: 成功
    Service-->>App: 更新されたTodoItem
    App->>App: useState更新（自動再レンダリング）
    App->>User: スタイル自動更新（打ち消し線）
```

## Requirements Traceability

| Requirement | 要件概要 | コンポーネント | インターフェース | フロー |
|-------------|---------|--------------|----------------|--------|
| 1.1 | タイトル入力してアイテム作成 | TodoService, App | createTodo() | 作成フロー |
| 1.2 | 空タイトルでエラー表示 | TodoForm | バリデーション | 作成フロー |
| 1.3 | 未完了状態で保存 | TodoService | createTodo() | 作成フロー |
| 1.4 | 作成日時の自動記録 | TodoService | createTodo() | 作成フロー |
| 2.1 | すべてのアイテムをリスト表示 | App, TodoList | useState, map() | - |
| 2.2 | タイトルと完了状態を表示 | TodoItem | Props表示 | - |
| 2.3 | 未完了と完了済みを視覚的に区別 | TodoItem | className切替 | - |
| 2.4 | 空リストでメッセージ表示 | TodoList | 条件付きレンダリング | - |
| 3.1 | 完了ボタンで状態変更 | TodoService | toggleTodo() | 完了トグルフロー |
| 3.2 | 完了マーク適用 | TodoItem | className切替 | 完了トグルフロー |
| 3.3 | 完了済みを未完了に戻す | TodoService | toggleTodo() | 完了トグルフロー |
| 3.4 | 完了日時を記録 | TodoService | toggleTodo() | 完了トグルフロー |
| 4.1 | 削除ボタンでアイテム削除 | TodoService | deleteTodo() | - |
| 4.2 | 削除を即座にUIから除去 | App | useState更新 | - |
| 4.3 | 完了状態でも削除可能 | TodoService | deleteTodo() | - |
| 4.4 | 削除は永続的（undo不可） | TodoService | deleteTodo() | - |
| 5.1 | 変更をLocalStorageに自動保存 | TodoRepository | saveTodos() | 全フロー |
| 5.2 | アプリ再起動時にデータ復元 | TodoRepository, useEffect | loadTodos() | - |
| 5.3 | 保存失敗時にエラー表示 | App | エラー状態表示 | 全フロー |
| 5.4 | LocalStorage不可時に警告 | TodoRepository, App | checkStorageAvailable() | - |

## Components and Interfaces

### プレゼンテーション層

#### App Component (Container)

**Responsibility & Boundaries**
- **Primary Responsibility**: アプリケーション全体の状態管理、ビジネスロジックの呼び出し、子コンポーネントへのprops渡し
- **Domain Boundary**: プレゼンテーション層のコンテナ。ビジネスロジックはTodoServiceに委譲
- **Data Ownership**: useStateによるTODOリストの状態管理、エラー状態の管理

**Dependencies**
- **Inbound**: なし（ルートコンポーネント）
- **Outbound**: TodoService、TodoRepository
- **External**: React Hooks (useState, useEffect)

**Contract Definition**

```typescript
interface AppProps {}

interface AppState {
  todos: TodoItem[];
  error: string | null;
  loading: boolean;
}

const App: React.FC<AppProps> = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // useEffectでLocalStorageから初期データ読み込み
  useEffect(() => { /* loadTodos */ }, []);

  // useEffectで状態変更時に自動保存
  useEffect(() => { /* saveTodos */ }, [todos]);

  // イベントハンドラ
  const handleCreate = (title: string): void => { /* ... */ };
  const handleToggle = (id: string): void => { /* ... */ };
  const handleDelete = (id: string): void => { /* ... */ };

  return (
    <div>
      <TodoForm onSubmit={handleCreate} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

**Invariants**:
- todosステートは常にLocalStorageと同期
- エラー発生時、errorステートに適切なメッセージが設定される

#### TodoForm Component (Presentational)

**Responsibility & Boundaries**
- **Primary Responsibility**: TODOアイテム作成用の入力フォームの表示とバリデーション
- **Domain Boundary**: 表示とバリデーションのみ。データ操作は親に委譲

**Contract Definition**

```typescript
interface TodoFormProps {
  onSubmit: (title: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') {
      setValidationError('タイトルを入力してください');
      return;
    }
    onSubmit(title);
    setTitle('');
    setValidationError(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">追加</button>
      {validationError && <span className="error">{validationError}</span>}
    </form>
  );
};
```

#### TodoList Component (Presentational)

**Responsibility & Boundaries**
- **Primary Responsibility**: TODOアイテムのリスト表示
- **Domain Boundary**: 表示のみ。アクションは親に委譲

**Contract Definition**

```typescript
interface TodoListProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return <p>TODOアイテムがありません</p>;
  }

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
```

#### TodoItem Component (Presentational)

**Responsibility & Boundaries**
- **Primary Responsibility**: 個別TODOアイテムの表示と完了/削除ボタン
- **Domain Boundary**: 表示のみ。アクションは親に委譲

**Contract Definition**

```typescript
interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <li className={todo.completed ? 'completed' : ''}>
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
      <button onClick={() => onToggle(todo.id)}>
        {todo.completed ? '未完了に戻す' : '完了'}
      </button>
      <button onClick={() => onDelete(todo.id)}>削除</button>
    </li>
  );
};
```

### ビジネスロジック層

#### TodoService

**Responsibility & Boundaries**
- **Primary Responsibility**: TODOアイテムのCRUD操作、ビジネスルールの適用、データの整合性維持
- **Domain Boundary**: TODOアイテムのライフサイクル管理
- **Data Ownership**: メモリ内のTODOアイテムリストの管理

**Dependencies**
- **Inbound**: App Component
- **Outbound**: TodoRepository
- **External**: crypto.randomUUID()

**Contract Definition**

```typescript
interface TodoService {
  // CRUD操作
  getAllTodos(): TodoItem[];
  getTodoById(id: string): TodoItem | null;
  createTodo(title: string): Result<TodoItem, CreateTodoError>;
  toggleTodo(id: string): Result<TodoItem, ToggleTodoError>;
  deleteTodo(id: string): Result<void, DeleteTodoError>;

  // 初期化
  loadTodos(): Result<void, StorageError>;
}

type CreateTodoError = {
  type: 'STORAGE_FAILED' | 'INVALID_TITLE';
  message: string;
};

type ToggleTodoError = {
  type: 'TODO_NOT_FOUND' | 'STORAGE_FAILED';
  message: string;
};

type DeleteTodoError = {
  type: 'TODO_NOT_FOUND' | 'STORAGE_FAILED';
  message: string;
};
```

**Preconditions**:
- TodoRepositoryが初期化済み
- createTodo: titleが非空文字列

**Postconditions**:
- すべての変更操作後、TodoRepositoryを通じてデータが永続化される
- エラー時はロールバックされ、一貫性が保たれる

**Invariants**:
- 各TODOアイテムは一意のUUIDを持つ
- createdAtは変更不可、completedAtは完了時のみ設定
- メモリ内のtodosリストとLocalStorageの内容は常に同期

### データ永続化層

#### TodoRepository

**Responsibility & Boundaries**
- **Primary Responsibility**: LocalStorageへのデータの読み書き、シリアライズ/デシリアライズ、ストレージ可用性チェック
- **Domain Boundary**: データ永続化のみ。ビジネスロジックは持たない
- **Data Ownership**: LocalStorageへのアクセス権限

**Dependencies**
- **Inbound**: TodoService、App Component
- **Outbound**: なし
- **External**: Browser LocalStorage API

**Contract Definition**

```typescript
interface TodoRepository {
  // Repository操作
  saveTodos(todos: TodoItem[]): Result<void, StorageError>;
  loadTodos(): Result<TodoItem[], StorageError>;
  clearTodos(): Result<void, StorageError>;

  // ストレージ可用性
  checkStorageAvailable(): boolean;
}

type StorageError = {
  type: 'STORAGE_UNAVAILABLE' | 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'WRITE_FAILED';
  message: string;
};
```

**Preconditions**:
- ブラウザがLocalStorage APIをサポート（モダンブラウザ）

**Postconditions**:
- saveTodos成功時、LocalStorageに有効なJSON文字列として保存
- loadTodos成功時、有効なTodoItem配列を返す
- エラー時は具体的なエラータイプを返す

**Invariants**:
- ストレージキーは常に`todos`を使用
- データは常にJSON形式でシリアライズ

## Data Models

### Domain Model

#### TodoItem

TODOアイテムの中核となるエンティティ。一意の識別子、タイトル、完了状態、タイムスタンプを持つ。

```typescript
interface TodoItem {
  id: string;              // UUID v4形式の一意識別子
  title: string;           // TODOアイテムのタイトル（非空）
  completed: boolean;      // 完了状態 (true: 完了, false: 未完了)
  createdAt: string;       // 作成日時 (ISO 8601形式)
  completedAt: string | null;  // 完了日時 (ISO 8601形式、未完了時はnull)
}
```

**Business Rules & Invariants**:
- `id`は生成後変更不可、システム全体で一意
- `title`は空文字列不可（作成時にバリデーション）
- `completed`がfalseの場合、`completedAt`は必ずnull
- `completed`がtrueの場合、`completedAt`は有効なISO 8601タイムスタンプ
- `createdAt`は作成時に自動設定され、変更不可

#### TodoList

TodoItemの集合を管理する集約ルート。

```typescript
type TodoList = TodoItem[];
```

**Consistency Rules**:
- リスト内のすべてのTodoItemは一意の`id`を持つ
- 削除操作は即座にリストから除去（論理削除なし）

### Physical Data Model

#### LocalStorage Schema

LocalStorageには単一のキー`todos`で全データを保存。

**Key**: `"todos"`

**Value**: JSON文字列化されたTodoItem配列

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "牛乳を買う",
    "completed": false,
    "createdAt": "2025-10-29T10:00:00.000Z",
    "completedAt": null
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "レポートを書く",
    "completed": true,
    "createdAt": "2025-10-29T09:30:00.000Z",
    "completedAt": "2025-10-29T15:45:00.000Z"
  }
]
```

**Storage Constraints**:
- LocalStorageの最大容量: 5-10MB（ブラウザ依存）
- 1TodoItem平均サイズ: 約200バイト
- 想定最大アイテム数: 約25,000件（実用的には数百件）

**Serialization Strategy**:
- `JSON.stringify()`でシリアライズ
- `JSON.parse()`でデシリアライズ
- パース失敗時は空配列`[]`をデフォルトとして扱う

## Error Handling

### Error Strategy

このアプリケーションでは、Result型パターンを使用してエラーを明示的に処理します。すべての操作は成功時に値を、失敗時にエラー詳細を返します。

```typescript
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };
```

### Error Categories and Responses

#### User Errors (入力バリデーションエラー)

**EMPTY_TITLE**
- **発生条件**: ユーザーが空のタイトルでTODOアイテムを作成しようとした
- **Response**: 入力フィールドの下に赤字でエラーメッセージ「タイトルを入力してください」を表示
- **Recovery**: ユーザーが有効なタイトルを入力するまで作成ボタンを無効化

#### System Errors (ストレージエラー)

**STORAGE_UNAVAILABLE**
- **発生条件**: LocalStorageがブラウザで無効化されているか、プライベートモードで使用不可
- **Response**: ページ上部に警告バナー「データの保存ができません。ブラウザ設定を確認してください。」
- **Recovery**: セッション中のみメモリ内でデータを保持。ページリロード時にデータ消失を警告

**QUOTA_EXCEEDED**
- **発生条件**: LocalStorageの容量制限を超えた
- **Response**: エラーメッセージ「ストレージ容量が不足しています。古いアイテムを削除してください。」
- **Recovery**: ユーザーに古いアイテムの削除を促す。保存試行を中止

**PARSE_ERROR**
- **発生条件**: LocalStorageのデータが破損していてパース不可
- **Response**: 警告メッセージ「保存データが破損しています。データをリセットしますか？」
- **Recovery**: ユーザーの確認後、LocalStorageをクリアして空のリストから再スタート

**WRITE_FAILED**
- **発生条件**: LocalStorage書き込み中の予期しないエラー
- **Response**: エラーメッセージ「データの保存に失敗しました。再試行してください。」
- **Recovery**: 前回保存成功時の状態を保持。ユーザーが再操作可能

#### Business Logic Errors

**TODO_NOT_FOUND**
- **発生条件**: 存在しないIDのTODOアイテムを操作しようとした
- **Response**: エラーメッセージ「アイテムが見つかりません。リストを更新します。」
- **Recovery**: リストを再描画して最新状態を表示

### Error Handling Flow

```mermaid
flowchart TD
    Start[ユーザーアクション] --> Validate{入力バリデーション}
    Validate -->|Invalid| ShowUserError[ユーザーエラー表示]
    ShowUserError --> End[終了]

    Validate -->|Valid| Execute[操作実行]
    Execute --> Storage{ストレージ操作}

    Storage -->|Success| UpdateUI[UI更新]
    UpdateUI --> End

    Storage -->|STORAGE_UNAVAILABLE| ShowWarning[警告バナー表示<br/>メモリモード切替]
    ShowWarning --> UpdateUI

    Storage -->|QUOTA_EXCEEDED| ShowQuotaError[容量エラー表示]
    ShowQuotaError --> End

    Storage -->|PARSE_ERROR| ConfirmReset{リセット確認}
    ConfirmReset -->|Yes| ClearStorage[ストレージクリア]
    ClearStorage --> UpdateUI
    ConfirmReset -->|No| End

    Storage -->|WRITE_FAILED| ShowRetry[再試行メッセージ]
    ShowRetry --> End
```

### Monitoring

#### Error Logging

本番環境では以下のエラー情報をconsole.error()でログ出力：
- エラータイプ
- エラーメッセージ
- タイムスタンプ
- 操作コンテキスト（作成/更新/削除/読み込み）

```javascript
console.error('[TodoApp Error]', {
  type: error.type,
  message: error.message,
  timestamp: new Date().toISOString(),
  context: 'createTodo'
});
```

#### Health Monitoring

- アプリ起動時にLocalStorage可用性をチェック
- 各操作後にストレージ容量を監視（警告閾値: 80%使用時）
- エラー発生率が高い場合、ユーザーに通知

## Testing Strategy

### Unit Tests

1. **TodoService.createTodo()**:
   - 有効なタイトルでTodoItemが正しく生成される
   - UUIDが一意に生成される
   - createdAtが正しい形式で設定される
   - 空タイトルでエラーが返される

2. **TodoService.toggleTodo()**:
   - 未完了→完了への状態変更が正しく動作
   - completedAtが設定される
   - 完了→未完了への状態変更でcompletedAtがnullになる
   - 存在しないIDでエラーが返される

3. **TodoService.deleteTodo()**:
   - 指定IDのアイテムがリストから削除される
   - 削除後のリスト長が正しい
   - 存在しないIDでエラーが返される

4. **TodoRepository.saveTodos()**:
   - TodoListが正しくJSON形式でLocalStorageに保存される
   - LocalStorage無効時にSTORAGE_UNAVAILABLEエラーが返される

5. **TodoRepository.loadTodos()**:
   - 保存されたデータが正しくTodoItem配列にパースされる
   - 破損データでPARSE_ERRORが返される
   - 空のストレージで空配列が返される

6. **React Component Tests**:
   - TodoFormコンポーネントが正しくレンダリングされる
   - TodoItemコンポーネントが完了状態で打ち消し線を適用する
   - TodoListコンポーネントが空配列で「TODOアイテムがありません」を表示する

### Integration Tests

1. **作成→保存→読み込みフロー**:
   - TodoServiceでアイテム作成
   - TodoRepositoryで保存
   - useEffectによる自動保存確認
   - ページリロードシミュレーション
   - 保存したアイテムが正しく復元される

2. **完了トグル→永続化フロー**:
   - アイテムの完了状態を変更
   - useEffectトリガーでLocalStorageに反映
   - リロード後も完了状態が保持される

3. **削除→永続化フロー**:
   - アイテムを削除
   - useState更新でLocalStorageから削除
   - リロード後も削除状態が保持される

4. **エラーハンドリング統合**:
   - LocalStorageを無効化
   - 操作実行
   - Appコンポーネントのerrorステートに反映
   - 適切なエラーメッセージがUIに表示される

5. **React Hooks統合**:
   - useEffectによる初期データ読み込み
   - useStateによる状態管理とUI自動更新
   - 作成→完了→削除の連続操作で正しく再レンダリング

### E2E/UI Tests

テストツール: React Testing Library + Jest または Vitest

1. **TODOアイテム作成フロー**:
   - input要素に文字列を入力
   - 作成ボタンをクリック
   - 新しいアイテムがリストに表示される
   - input要素がクリアされる

2. **空タイトルバリデーション**:
   - 空のinputで作成ボタンをクリック
   - エラーメッセージが表示される（screen.getByText()で確認）
   - リスト項目が増加しない

3. **完了トグル操作**:
   - 未完了アイテムの完了ボタンをクリック
   - text-decorationスタイルが'line-through'になる
   - 再度クリックで'none'に戻る

4. **アイテム削除操作**:
   - アイテムの削除ボタンをクリック
   - アイテムがDOMから削除される（queryByText()でnull確認）
   - リスト項目数が減少する

5. **データ永続化確認**:
   - 複数のアイテムを作成
   - LocalStorage.getItem('todos')でデータ確認
   - コンポーネント再マウント
   - すべてのアイテムが復元される

### Performance Tests

1. **大量アイテムのレンダリング**:
   - 100件のTODOアイテムを作成
   - Reactの仮想DOMによるリスト描画が1秒以内に完了
   - 再レンダリングのパフォーマンスを確認

2. **連続操作のパフォーマンス**:
   - 10件のアイテムを連続作成
   - 各操作でのuseState更新が100ms以内に完了
   - 不要な再レンダリングが発生しないことを確認

3. **LocalStorage読み書き速度**:
   - 50件のアイテムをLocalStorageに保存
   - useEffectトリガーでの保存が50ms以内に完了
   - 読み込みが50ms以内に完了

4. **React コンポーネントメモリ使用量**:
   - 500件のアイテムを作成
   - コンポーネントツリーのメモリ使用量が50MB以下
   - メモリリークが発生しないことを確認
