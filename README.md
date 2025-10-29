# TODO App with cc-sdd

このリポジトリは、[cc-sdd (Claude Code Specification-Driven Development)](https://github.com/gotalab/cc-sdd) を使ってTODOアプリを開発し、specを更新していくプロセスを体験するためのサンプルプロジェクトです。

## cc-sddとは

cc-sddは、Claude Codeを使った仕様駆動開発のアプローチです。specディレクトリに仕様ファイルを配置し、Claude Codeがそれを参照しながら開発を進めることで、一貫性のある実装を実現します。

## 初期設定

### 1. リポジトリの初期化

```bash
# リポジトリを作成
mkdir todo-app-with-cc-sdd
cd todo-app-with-cc-sdd
git init
```

### 2. cc-sddのインストール

```bash
# cc-sddを日本語でインストール
npx cc-sdd@latest --lang ja
```

これにより以下が追加されます：
- `.claude/commands/kiro/` 配下に10個のslashコマンド
- `CLAUDE.md` プロジェクトドキュメント
- `.claude/settings.local.json` ローカル設定（gitignore対象）

### 3. .gitignoreの設定

`.claude/settings.local.json` はローカル環境固有の設定なので、`.gitignore` に追加：

```gitignore
# Local settings
.claude/settings.local.json

# Dependencies
node_modules/

# Environment variables
.env
.env.local
```

### 4. 初回コミット

```bash
git add .
git commit -m "Add cc-sdd setup with Japanese language support"
```

## 開発フロー

cc-sddでは以下の順序で開発を進めます：

### 1. 機能の初期化
```
/kiro:spec-init [機能の説明]
```
例: `/kiro:spec-init TODOアプリの基本機能（作成・表示・完了・削除）`

### 2. 要件定義
```
/kiro:spec-requirements [feature-id]
```

### 3. 設計
```
/kiro:spec-design [feature-id] -y
```

### 4. タスク分解
```
/kiro:spec-tasks [feature-id] -y
```

### 5. 実装
```
/kiro:spec-impl [feature-id] [task-ids]
```
例: `/kiro:spec-impl todo-basic 1.1,1.2,1.3`

### その他の便利なコマンド

- `/kiro:spec-status` - 現在の仕様の状態を確認
- `/kiro:steering` - プロジェクト文脈を学習（既存プロジェクト向け）
- `/kiro:validate-gap [feature-id]` - 既存コードとの差分を分析

## プロジェクト構成

```
.
├── spec/           # 仕様ファイル
├── src/            # ソースコード
└── tests/          # テスト
```

## 学べること

- cc-sddを使った開発フロー
- specファイルの書き方と更新方法
- Claude Codeとの効果的な協働方法

## 参考リンク

- [cc-sdd GitHub リポジトリ](https://github.com/gotalab/cc-sdd)
