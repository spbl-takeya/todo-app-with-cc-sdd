# Implementation Tasks: due-date

## 概要

due-date機能の実装タスク一覧。全タスク完了済み。

---

## Phase 1: 型定義とユーティリティ

### Task 1.1: 型定義の拡張
- [x] `TodoItem` インターフェースに `dueDate: string | null` フィールドを追加
- [x] `UpdateDueDateError` 型を定義
- [x] `DueDateStatus` 型を定義
- [x] `SortOption` 型を定義
- [x] `FilterOption` 型を定義

**対象ファイル**: `src/types/todo.ts`

### Task 1.2: 日付ユーティリティの作成
- [x] `getDueDateStatus()` - 期限状態判定関数を実装
- [x] `isValidDueDate()` - 日付バリデーション関数を実装
- [x] `formatDueDate()` - 表示フォーマット関数を実装
- [x] `isToday()` - 今日判定関数を実装
- [x] `isThisWeek()` - 今週判定関数を実装
- [x] `isThisMonth()` - 今月判定関数を実装
- [x] `isOverdue()` - 期限切れ判定関数を実装

**対象ファイル**: `src/utils/dateUtils.ts` (新規)

### Task 1.3: ユーティリティテストの作成
- [x] `getDueDateStatus` のテスト（各状態パターン）
- [x] `isValidDueDate` のテスト（有効/無効形式）
- [x] `formatDueDate` のテスト
- [x] フィルター関数のテスト（isToday, isThisWeek, isThisMonth）
- [x] `isOverdue` のテスト

**対象ファイル**: `src/utils/dateUtils.test.ts` (新規)

---

## Phase 2: Service層

### Task 2.1: TodoServiceの拡張
- [x] `createTodo(title, dueDate?)` - dueDate引数を追加
- [x] `updateDueDate(id, dueDate)` - 新規メソッドを実装
- [x] `getSortedTodos(sortOption)` - ソート機能を実装
- [x] `getFilteredTodos(filterOption)` - フィルター機能を実装
- [x] バリデーション処理を追加
- [x] ロールバック処理を実装

**対象ファイル**: `src/services/TodoService.ts`

### Task 2.2: Serviceテストの更新
- [x] 既存テストが新しいシグネチャで動作することを確認
- [x] 新規メソッドのテストケースを追加（必要に応じて）

**対象ファイル**: `src/services/TodoService.test.ts`

---

## Phase 3: Repository層

### Task 3.1: 後方互換性の実装
- [x] `loadTodos()` で既存データに `dueDate: null` を補完
- [x] パースエラー時のグレースフルデグラデーション

**対象ファイル**: `src/repositories/TodoRepository.ts`

### Task 3.2: Repositoryテストの更新
- [x] テストフィクスチャに `dueDate` フィールドを追加
- [x] 後方互換性のテストケース確認

**対象ファイル**: `src/repositories/TodoRepository.test.ts`

---

## Phase 4: コンポーネント層

### Task 4.1: TodoFormの拡張
- [x] `dueDate` stateを追加
- [x] `<input type="date">` フィールドを追加
- [x] `onSubmit` シグネチャを `(title, dueDate)` に変更
- [x] 送信時のリセット処理を更新

**対象ファイル**: `src/components/TodoForm.tsx`

### Task 4.2: TodoItemの拡張
- [x] 期限表示エリアを追加
- [x] インライン編集機能を実装（isEditingDueDate state）
- [x] `getDueDateStatus` による状態判定を追加
- [x] 色分けクラス名の計算（useMemo）
- [x] `onUpdateDueDate` props対応
- [x] 保存/キャンセルボタンを実装

**対象ファイル**: `src/components/TodoItem.tsx`

### Task 4.3: TodoListの更新
- [x] `onUpdateDueDate` propsを追加
- [x] TodoItemComponentへのprops伝播

**対象ファイル**: `src/components/TodoList.tsx`

### Task 4.4: TodoFilterの作成
- [x] コンポーネント構造を設計
- [x] ソート選択UIを実装
- [x] フィルター選択UIを実装
- [x] `React.memo` でメモ化

**対象ファイル**: `src/components/TodoFilter.tsx` (新規)

### Task 4.5: コンポーネントテストの更新
- [x] TodoFormテストを新シグネチャに対応

**対象ファイル**: `src/components/TodoForm.test.tsx`

---

## Phase 5: App統合

### Task 5.1: App.tsxの更新
- [x] `sortOption`, `filterOption` stateを追加
- [x] `handleCreate` を新シグネチャに対応
- [x] `handleUpdateDueDate` ハンドラーを追加
- [x] `displayTodos` メモ化を実装
- [x] TodoFilterコンポーネントを統合
- [x] TodoListに `onUpdateDueDate` を渡す

**対象ファイル**: `src/App.tsx`

---

## Phase 6: スタイル

### Task 6.1: CSSの追加
- [x] 期限入力フィールドのスタイル
- [x] フィルター/ソートUIのスタイル
- [x] 期限表示エリアのスタイル
- [x] 期限切れ（赤）のスタイル
- [x] 期限間近（黄）のスタイル
- [x] 編集ボタンのスタイル

**対象ファイル**: `src/App.css`

---

## Phase 7: テストと検証

### Task 7.1: テスト実行
- [x] 全既存テスト（79件）がパスすることを確認
- [x] 新規テスト（20件）がパスすることを確認
- [x] 合計99件のテストがパス

### Task 7.2: ビルド検証
- [x] TypeScriptコンパイルが成功
- [x] Viteビルドが成功

### Task 7.3: 動作確認
- [x] TODO作成時に期限設定が可能
- [x] 期限の編集・削除が可能
- [x] 期限切れ/期限間近の色分けが正常
- [x] ソート機能が正常動作
- [x] フィルター機能が正常動作

---

## 完了サマリー

| フェーズ | タスク数 | 完了 |
|---------|---------|------|
| Phase 1: 型定義とユーティリティ | 3 | ✅ |
| Phase 2: Service層 | 2 | ✅ |
| Phase 3: Repository層 | 2 | ✅ |
| Phase 4: コンポーネント層 | 5 | ✅ |
| Phase 5: App統合 | 1 | ✅ |
| Phase 6: スタイル | 1 | ✅ |
| Phase 7: テストと検証 | 3 | ✅ |
| **合計** | **17** | **✅ 100%** |

---

## 成果物

### 新規ファイル (4件)
- `src/utils/dateUtils.ts`
- `src/utils/dateUtils.test.ts`
- `src/components/TodoFilter.tsx`

### 変更ファイル (10件)
- `src/types/todo.ts`
- `src/services/TodoService.ts`
- `src/repositories/TodoRepository.ts`
- `src/components/TodoForm.tsx`
- `src/components/TodoForm.test.tsx`
- `src/components/TodoItem.tsx`
- `src/components/TodoList.tsx`
- `src/repositories/TodoRepository.test.ts`
- `src/App.tsx`
- `src/App.css`

### テスト結果
- 既存テスト: 79件 → 79件（全パス）
- 新規テスト: 20件（全パス）
- 合計: 99件パス
