# TODO App with cc-sdd

このリポジトリは、[cc-sdd (Claude Code Specification-Driven Development)](https://github.com/gotalab/cc-sdd) を使ってTODOアプリを開発し、specを更新していくプロセスを体験するためのサンプルプロジェクトです。

## cc-sddとは

cc-sddは、Claude Codeを使った仕様駆動開発のアプローチです。specディレクトリに仕様ファイルを配置し、Claude Codeがそれを参照しながら開発を進めることで、一貫性のある実装を実現します。

## 使い方

1. **初期設定**
   ```bash
   # 依存関係のインストール
   npm install
   ```

2. **開発**
   - `spec/` ディレクトリに仕様ファイルを作成
   - Claude Codeに実装を依頼
   - 実装後、必要に応じてspecを更新

3. **specの構成**
   - `spec/` ディレクトリに各機能の仕様を記述
   - 要件、データモデル、API仕様などを明確に定義

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
