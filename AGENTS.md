# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 概要

HEXAWORK CONTACT プロジェクト用の単一ファイル HTML チェックリストツール（`memo-app.html`）です。チェックボックスの状態とメモ欄をクッキーで保持するブラウザベースの作業管理チェックリストです。

**メイン編集ファイル**: `memo-app_free-check-seet_02.html`（`memo-app_free-check-seet.html` から複製、2026-06-06以降）

## 開発サーバの起動

```bash
npm run server
# → http://localhost:2001/ で起動
```

`server.js` はポート 2001 の静的ファイルサーバ。`/` へのアクセスはファイル一覧を表示するため、`memo-app.html` を開くには `http://localhost:2001/memo-app.html` と直接指定する。

## アーキテクチャ

アプリケーション全体は `memo-app.html` 一ファイルに完結しています。

- **レイアウト**: CSS Grid（`grid-template-columns: auto 1fr`）— 左カラムにチェックボックスとリンク（折り返しなし）、右カラムにメモ入力欄（残り幅を占有）を配置。
- **データ永続化**: すべての状態（チェックボックスとメモテキスト）を `localStorage` に保存。ファイルごとに異なるキーを使用（例: `memo_app_checkboxes` / `free_sheet_02_checkboxes` など）してキー衝突を防いでいる。
- **セクション構成**: コンタクトおよび応募フォームの外部 `.blade.html` ファイルへのリンクと、`hexawork.jp` の本番 URL を含む。
- **show ボタン**: 右カラムのすべての `input[type="text"]` の値を収集し、`#show_area` に表示する。

## 注意事項

- スクリプトは単一の `<form>` 要素を前提としており、すべての `querySelectorAll` はその form にスコープされています。form 外へ要素を移動した場合、状態は保存されません。
- チェックボックスとメモの保存はインデックス順に依存しているため、行を挿入・削除するとクッキーの保存データがずれます。

## 用語

- **「UI」** → `#page-switcher`（画面右下のフロートUI）
- **「メモ」** → メインのメモエリア（チェックボックス行・textarea・タイトルバーなど）

## メモリ

「記憶して」と言われた場合はこの AGENTS.md に直接追記する。

- ポート2001でサーバ起動。LAN/外部URLやスマホからのアクセスも同ポート。
- フロートUIはコンパクト優先（スペース節約が核コンセプト）。
- 「UI」=`#page-switcher`（フロートUI）、「メモ」=メインのメモエリア。
- iOSの共有UI（Web Share API / Share Sheet）は「共有シート」ではなく**「共有ダイアログ」**と呼ぶ（「シート」はスプレッドシートと紛らわしいため）。
- サーバの公開アドレスは https://www.i-elements.net:2001 。ユーザーに紹介・案内する際はこのURLを出す（`localhost:2001` ではなく）。
