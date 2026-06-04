# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

HEXAWORK CONTACT プロジェクト用の単一ファイル HTML チェックリストツールです。チェックボックスの状態とメモ欄をクッキーで保持するブラウザベースの作業管理チェックリストです。

**メインの編集対象ファイル: `memo-app_free-check-seet02.html`**（`memo-app_free-check-seet.html` からコピーして作成）

## 開発サーバの起動

```bash
npm run server
# → http://localhost:2001/ で起動
```

`server.js` はポート 2001 の静的ファイルサーバ。`/` へのアクセスは `/__index.html` にリダイレクトされるため、`memo-app.html` を開くには `http://localhost:2001/memo-app.html` と直接指定する。

## アーキテクチャ

アプリケーション全体は `memo-app.html` 一ファイルに完結しています。

- **レイアウト**: CSS Grid（`grid-template-columns: auto 1fr`）— 左カラムにチェックボックスとリンク（折り返しなし）、右カラムにメモ入力欄（残り幅を占有）を配置。
- **データ永続化**: すべての状態（チェックボックスとメモテキスト）を2つのクッキーで保存 — `index_checkboxes`（真偽値の JSON 配列）と `index_memos`（文字列の JSON 配列）、いずれも有効期限 365 日。クッキーの容量制限（約 4KB）は既知の制約であり、内容が増える場合は `localStorage` への移行を検討すること。
- **セクション構成**: コンタクトおよび応募フォームの外部 `.blade.html` ファイルへのリンクと、`hexawork.jp` の本番 URL を含む。
- **show ボタン**: 右カラムのすべての `input[type="text"]` の値を収集し、`#show_area` に表示する。

## 注意事項

- スクリプトは単一の `<form>` 要素を前提としており、すべての `querySelectorAll` はその form にスコープされています。form 外へ要素を移動した場合、状態は保存されません。
- チェックボックスとメモの保存はインデックス順に依存しているため、行を挿入・削除するとクッキーの保存データがずれます。
