# Requirements Document

## Project Description (Input)

TODOアプリに期限設定機能を追加します。

### 機能概要
各TODOアイテムに期限（due date）を設定できるようにし、期限に基づいた管理と表示を実現します。

### 主要機能
1. **期限の設定・編集**
   - TODOアイテム作成時に期限を設定可能（オプショナル）
   - 既存のTODOアイテムの期限を編集可能
   - 期限を削除（未設定に戻す）可能

2. **期限の表示**
   - 各TODOアイテムに期限を表示
   - 期限が近い・過ぎている場合の視覚的な警告表示
   - 期限未設定の場合は「期限なし」と表示

3. **期限ベースのフィルタリング・ソート**
   - 期限順でソート（昇順・降順）
   - 期限切れのアイテムのフィルタリング
   - 今日・今週・今月が期限のアイテムのフィルタリング

4. **期限の状態管理**
   - 期限切れ（overdue）: 期限が過去で未完了
   - 期限間近（due soon）: 期限が24時間以内で未完了
   - 期限内（on time）: 期限まで余裕がある
   - 期限なし（no due date）: 期限が設定されていない

### 技術要件
- 既存のTodoItemインターフェースにdueDate: string | nullフィールドを追加
- ISO 8601形式（YYYY-MM-DD）で日付を保存
- 既存のLocalStorage永続化との互換性を維持
- 既存のテストが壊れないようにマイグレーション対応

### UI/UX要件
- 日付入力用のdate input要素を使用
- 期限切れは赤色、期限間近は黄色で強調表示
- 期限でのソート機能をUIに追加
- レスポンシブデザインを維持

### 非機能要件
- パフォーマンス: 既存機能のパフォーマンスを劣化させない
- 後方互換性: 既存のLocalStorageデータ（期限なし）を正しく読み込む
- テストカバレッジ: 新機能も80%以上のカバレッジ

---

## Introduction

本要件は、TODOアプリケーションに期限管理機能を追加することで、ユーザーがタスクの優先順位付けと時間管理をより効果的に行えるようにすることを目的としています。期限の設定、表示、フィルタリング機能により、ユーザーは期限切れや緊急のタスクを見逃すことなく管理できるようになります。

既存のTODOアプリの基本機能（作成・表示・完了・削除）を維持しながら、後方互換性を保った形で期限管理機能を追加します。

## Requirements

### Requirement 1: 期限の設定機能

**Objective:** As a TODOアプリユーザー, I want TODOアイテムに期限を設定できる, so that タスクの締め切りを管理し、優先順位を明確にできる

#### Acceptance Criteria

1. WHEN ユーザーが新しいTODOアイテムを作成する THEN TODOアプリ SHALL 期限を入力できる日付選択フィールドを表示する
2. WHEN ユーザーが期限を入力せずにTODOアイテムを作成する THEN TODOアプリ SHALL 期限なし（null）としてアイテムを作成する
3. WHEN ユーザーが有効な日付を期限として入力する THEN TODOアプリ SHALL その日付をYYYY-MM-DD形式（ISO 8601）で保存する
4. WHEN ユーザーが過去の日付を期限として入力する THEN TODOアプリ SHALL その日付を受け入れ、期限切れとして扱う
5. WHEN ユーザーが無効な日付形式を入力しようとする THEN TODOアプリ SHALL エラーメッセージを表示し、入力を受け付けない

### Requirement 2: 期限の編集機能

**Objective:** As a TODOアプリユーザー, I want 既存のTODOアイテムの期限を変更できる, so that 計画変更に柔軟に対応できる

#### Acceptance Criteria

1. WHEN ユーザーが既存のTODOアイテムを選択する THEN TODOアプリ SHALL 現在の期限を編集可能な状態で表示する
2. WHEN ユーザーが期限を新しい日付に変更する THEN TODOアプリ SHALL 変更を保存し、LocalStorageに永続化する
3. WHEN ユーザーが設定済みの期限を削除する THEN TODOアプリ SHALL 期限をnullに設定し、「期限なし」状態に戻す
4. WHEN ユーザーが期限なしのアイテムに期限を追加する THEN TODOアプリ SHALL 新しい期限を設定し保存する
5. IF 期限の編集中にストレージエラーが発生する THEN TODOアプリ SHALL エラーメッセージを表示し、変更前の状態を維持する

### Requirement 3: 期限の表示機能

**Objective:** As a TODOアプリユーザー, I want 各TODOアイテムの期限を明確に確認できる, so that どのタスクが緊急かを一目で判断できる

#### Acceptance Criteria

1. WHEN TODOアイテムに期限が設定されている THEN TODOアプリ SHALL 期限を読みやすい形式（例：2025年1月15日）で表示する
2. WHEN TODOアイテムに期限が設定されていない THEN TODOアプリ SHALL 「期限なし」と表示する
3. IF TODOアイテムが未完了 AND 期限が現在時刻より過去である THEN TODOアプリ SHALL そのアイテムを赤色で強調表示する
4. IF TODOアイテムが未完了 AND 期限が24時間以内である THEN TODOアプリ SHALL そのアイテムを黄色で警告表示する
5. IF TODOアイテムが完了済みである THEN TODOアプリ SHALL 期限の色による強調表示を行わない
6. WHEN ユーザーがTODOリストを表示する THEN TODOアプリ SHALL すべてのアイテムの期限情報を同時に表示する

### Requirement 4: 期限の状態分類

**Objective:** As a TODOアプリユーザー, I want TODOアイテムの期限状態を自動的に分類してほしい, so that 緊急度に応じたアクションを取れる

#### Acceptance Criteria

1. IF TODOアイテムの期限がnullである THEN TODOアプリ SHALL そのアイテムを「期限なし」状態として分類する
2. IF TODOアイテムが未完了 AND 期限が現在日時より過去である THEN TODOアプリ SHALL そのアイテムを「期限切れ」状態として分類する
3. IF TODOアイテムが未完了 AND 期限が現在時刻から24時間以内である THEN TODOアプリ SHALL そのアイテムを「期限間近」状態として分類する
4. IF TODOアイテムが未完了 AND 期限が24時間より先である THEN TODOアプリ SHALL そのアイテムを「期限内」状態として分類する
5. IF TODOアイテムが完了済みである THEN TODOアプリ SHALL 期限に関係なく通常の完了済み状態として扱う

### Requirement 5: 期限によるソート機能

**Objective:** As a TODOアプリユーザー, I want TODOアイテムを期限順に並び替えられる, so that 優先すべきタスクを効率的に把握できる

#### Acceptance Criteria

1. WHEN ユーザーが「期限順（昇順）」ソートを選択する THEN TODOアプリ SHALL 期限が早い順にアイテムを並び替える
2. WHEN ユーザーが「期限順（降順）」ソートを選択する THEN TODOアプリ SHALL 期限が遅い順にアイテムを並び替える
3. WHEN 期限順ソートが適用されている AND 期限なしのアイテムが存在する THEN TODOアプリ SHALL 期限なしのアイテムをリストの最後に配置する
4. WHEN 複数のアイテムが同じ期限を持つ THEN TODOアプリ SHALL 作成日時順（createdAt）で二次ソートを行う
5. WHEN ユーザーがソート順を変更する THEN TODOアプリ SHALL ソート設定をLocalStorageに保存し、次回起動時に復元する

### Requirement 6: 期限によるフィルタリング機能

**Objective:** As a TODOアプリユーザー, I want 期限に基づいてTODOアイテムを絞り込める, so that 特定の期間内のタスクに集中できる

#### Acceptance Criteria

1. WHEN ユーザーが「期限切れ」フィルターを選択する THEN TODOアプリ SHALL 未完了かつ期限が過去のアイテムのみを表示する
2. WHEN ユーザーが「今日」フィルターを選択する THEN TODOアプリ SHALL 期限が本日のアイテムのみを表示する
3. WHEN ユーザーが「今週」フィルターを選択する THEN TODOアプリ SHALL 期限が今週（月曜〜日曜）以内のアイテムのみを表示する
4. WHEN ユーザーが「今月」フィルターを選択する THEN TODOアプリ SHALL 期限が今月以内のアイテムのみを表示する
5. WHEN ユーザーが「期限なし」フィルターを選択する THEN TODOアプリ SHALL 期限が設定されていないアイテムのみを表示する
6. WHEN ユーザーがフィルターを解除する THEN TODOアプリ SHALL すべてのアイテムを表示する

### Requirement 7: データモデルの拡張

**Objective:** As a 開発者, I want 既存のTodoItem型に期限フィールドを追加する, so that 型安全性を保ちながら期限データを管理できる

#### Acceptance Criteria

1. WHEN TodoItem型が定義される THEN TODOアプリ SHALL dueDateフィールド（string | null型）を含む
2. WHEN dueDateがstring型の値を持つ THEN TODOアプリ SHALL その値がYYYY-MM-DD形式（ISO 8601）に準拠していることを保証する
3. WHEN dueDateがnullの値を持つ THEN TODOアプリ SHALL そのアイテムは期限なしとして扱われる
4. WHEN UpdateTodoError型を定義する THEN TODOアプリ SHALL 'INVALID_DUE_DATE' | 'TODO_NOT_FOUND' | 'STORAGE_ERROR'のエラータイプを含む

### Requirement 8: データ永続化と後方互換性

**Objective:** As a 開発者, I want 既存のLocalStorageデータと互換性を保つ, so that 既存ユーザーのデータを失わずにアップグレードできる

#### Acceptance Criteria

1. WHEN 既存のTODOデータ（dueDateフィールドなし）を読み込む THEN TODOアプリ SHALL dueDateをnullとして扱い、正常に動作する
2. WHEN 新しい期限付きTODOデータを保存する THEN TODOアプリ SHALL dueDateフィールドを含むJSON形式でLocalStorageに保存する
3. WHEN LocalStorageからデータを読み込む AND パースエラーが発生する THEN TODOアプリ SHALL 適切なエラーメッセージを表示し、データを破損させない
4. WHEN 期限データを含むTODOアイテムを削除する THEN TODOアプリ SHALL 完全にLocalStorageから削除する

### Requirement 9: UI/UXの一貫性

**Objective:** As a TODOアプリユーザー, I want 期限機能が既存UIに自然に統合されている, so that 学習コストなしに新機能を使える

#### Acceptance Criteria

1. WHEN 期限入力フィールドを表示する THEN TODOアプリ SHALL HTML5のdate input要素を使用する
2. WHEN ユーザーがモバイルデバイスでアクセスする THEN TODOアプリ SHALL ネイティブの日付ピッカーUIを表示する
3. WHEN 期限表示エリアを配置する THEN TODOアプリ SHALL 既存のTODOアイテムレイアウトを崩さない形で統合する
4. WHEN ソート・フィルター機能を追加する THEN TODOアプリ SHALL 既存のUIパターンに従ったデザインを適用する
5. WHEN レスポンシブデザインを維持する THEN TODOアプリ SHALL すべての画面サイズで期限機能が正常に表示・操作できる

### Requirement 10: パフォーマンスとテスト

**Objective:** As a 開発者, I want 期限機能が既存のパフォーマンスとテスト品質を維持する, so that アプリの安定性を保証できる

#### Acceptance Criteria

1. WHEN 期限機能を実装する THEN TODOアプリ SHALL 既存の全テスト（79テスト）が引き続き合格する
2. WHEN 新しい期限機能のテストを追加する THEN TODOアプリ SHALL 期限関連コードに対して80%以上のテストカバレッジを達成する
3. WHEN 100件以上のTODOアイテムが存在する THEN TODOアプリ SHALL 期限計算とソート処理が200ms以内に完了する
4. WHEN 期限状態の判定を行う THEN TODOアプリ SHALL 不要な再計算を避け、メモ化を適用する
5. WHEN LocalStorageへの読み書きを行う THEN TODOアプリ SHALL 既存のパフォーマンス基準（作成・読み込み・更新の各操作）を劣化させない
