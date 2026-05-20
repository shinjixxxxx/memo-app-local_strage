# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

HEXAWORK プロジェクト用のブラウザベース作業管理ツール集です。Node.js の静的ファイルサーバ（`server.js`）で配信し、複数の単一ファイル HTML ツールで構成されます。バックエンドは不要で、状態保存はすべてブラウザ側（Cookie または localStorage）で完結します。

## ファイル構成

```
.
├── index.html                     # ツール一覧ページ（ランディングページ）
├── memo-app.html                  # 作業チェックリスト（HEXAWORK CONTACT 用・Cookie 保存）
├── memo-app_free-check-seet.html  # フリー版チェックリスト（行追加/削除/並び替え対応・Cookie 保存）
├── screen-check.html              # スクリーンチェックリスト（CSV 読み込み・localStorage 保存）
├── screens.csv                    # screen-check.html 用の URL 一覧（編集して使う）
├── server.js                      # 静的ファイルサーバ（ポート 2001）＋ /screenshot API
├── screenshot.js                  # スタンドアロン Puppeteer スクリーンショットスクリプト
├── plan.md                        # 開発計画メモ（参照用）
├── package.json                   # npm 設定（puppeteer 依存）
└── SCREENSHOTS/                   # スクリーンショット保存先（.gitignore・自動生成）
```

## 開発サーバの起動

```bash
npm install        # 初回のみ（puppeteer のインストール）
npm run server     # → http://localhost:2001/ で起動
```

- ポートは **2001**
- `/` へのアクセスはディレクトリ内ファイルの一覧を HTML で返す
- 各ツールには直接 URL でアクセスする:
  - `http://localhost:2001/index.html` — ツール一覧
  - `http://localhost:2001/memo-app.html` — 作業チェックリスト
  - `http://localhost:2001/memo-app_free-check-seet.html` — フリー版チェックリスト
  - `http://localhost:2001/screen-check.html` — スクリーンチェックリスト

## 各ツールのアーキテクチャ

### `memo-app.html` — 作業チェックリスト（固定行）

HEXAWORK CONTACT プロジェクト専用のチェックリスト。行構成は固定で、HTML を直接編集して変更する。

**レイアウト**: CSS Grid（`grid-template-columns: auto 1fr`）
- 左カラム: チェックボックス群とリンク（`white-space: nowrap`）
- 右カラム: 1 行メモ欄（`input.memo`）、残り幅を占有

**セクション構成**:
1. 先頭 12 行: 汎用タスク行（予定/作業/作業終了/確認 × 4 チェックボックス + メモ）
2. コンタクトフォーム（編集用 `.blade.html` へのリンク）: 01〜04
3. 応募フォーム（編集用 `.blade.html` へのリンク）: 11〜13
4. DB（本番サーバ `hexawork.jp` URL）
5. 未使用 html セクション（打ち消し線表示）
6. ページ下部: 4 行 textarea メモ（上部）、10 行 textarea メモ（`.cocky`）

**データ永続化**: Cookie（365 日）
- `index_checkboxes`: チェック状態の JSON 配列（`boolean[]`）
- `index_memos`: メモテキストの JSON 配列（`string[]`）
- すべての要素を `form.querySelectorAll` でインデックス順に管理

**制約**:
- `<form>` 内にすべての要素が存在する前提。form 外へ移動すると保存されない
- Cookie の容量制限（約 4KB）がある。メモが増える場合は `localStorage` への移行を検討
- 行を挿入・削除するとインデックスがずれ、保存済みデータと不整合になる

---

### `memo-app_free-check-seet.html` — フリー版チェックリスト（動的行）

行の追加・削除・ドラッグ並び替えに対応した汎用版。

**レイアウト**: Flexbox（`#dynamic-rows`、縦積み）
- `.row` はドラッグ可能（`draggable="true"`）
- 各行先頭にドラッグハンドル（`⠿` アイコン）が動的に追加される

**機能**:
- `＋` ボタン: 行を末尾に追加
- `－` ボタン: 末尾の行を削除（最低 1 行を保持）
- ドラッグ＆ドロップで行を並び替え（`dragstart` / `dragover` / `dragend` イベント）

**データ永続化**: Cookie（365 日）
- `index_checkboxes`: チェック状態の JSON 配列
- `index_memos`: メモテキストの JSON 配列
- `index_extra_rows`: 保存された総行数（数値）
- 変更のたびに `saveAll()` で全状態を一括保存（インデックスずれ防止）

---

### `screen-check.html` — スクリーンチェックリスト

外部サイトのテスト確認用チェックリスト。

**データソース**: 起動時に `GET /screens.csv` を fetch して行を動的生成

**`screens.csv` の形式**:
```csv
id,name,url
1,トップページ,https://example.com/
2,ログイン画面,https://example.com/login
```
- `id`: 行識別子（スクリーンショットファイル名にも使用）
- `name`: 画面名（外部 URL へのリンクテキスト）
- `url`: チェック対象の URL

**テーブル列**: No. / 画面名（外部リンク） / 予定 / 作業 / 作業終了 / 確認 / メモ / スクリーンショット

**データ永続化**: **localStorage**（Cookie ではない）
- `sc_checkboxes`: `{ [id]: boolean[] }` 形式の JSON
- `sc_memos`: `{ [id]: string }` 形式の JSON
- `sc_screenshots`: `{ [id]: webPath }` 形式の JSON（サムネイル復元用）

**スクリーンショット機能**:
- 📷 ボタンクリック → `POST /screenshot` に `{ id, name, url }` を送信
- `server.js` が Puppeteer でページを撮影し `SCREENSHOTS/{id}_{name}.png` に保存
- 撮影後、行内にサムネイル（幅 80px）を表示
- サムネイルパスを localStorage に保存し、リロード後も復元

---

### `server.js` — 静的ファイルサーバ

Node.js 標準モジュール（`http`, `fs`, `path`）のみで実装したサーバ。ポート **2001**。

**エンドポイント**:
- `GET /` — ディレクトリ内ファイルの一覧を HTML で返す
- `GET /<file>` — 静的ファイルを配信（MIME タイプ: html/css/js/json/csv/png/jpg/svg/ico）
- `POST /screenshot` — Puppeteer でスクリーンショットを撮影し `SCREENSHOTS/` に保存
- CORS ヘッダーを全レスポンスに付与

**セキュリティ**: ルートディレクトリ外へのパストラバーサルを禁止（403 を返す）

**Puppeteer の設定**: `executablePath` が macOS の Chrome パスにハードコードされている
```
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```
Linux/Windows 環境では `server.js` の `executablePath` を変更するか、Puppeteer バンドル Chromium を使うよう修正が必要。

---

### `screenshot.js` — スタンドアロンスクリプト

`npm run screenshot` で実行する単独スクリプト。`memo-app.html` を `file://` プロトコルで開いてスクリーンショットを撮影し `SCREENSHOTS/` に保存する。

```bash
npm run screenshot
```

ファイル名: `{連番}_{YYYY-MM-DD__HH-MM}.png`

---

## npm スクリプト

```bash
npm run server      # server.js をポート 2001 で起動
npm run screenshot  # memo-app.html のスクリーンショットを撮影
```

## 依存パッケージ

- `puppeteer` ^24.x — ヘッドレス Chromium（スクリーンショット機能に必要）

## 開発上の注意事項

- **行の順序変更禁止**: `memo-app.html` と `memo-app_free-check-seet.html` の Cookie 保存はインデックス順に依存する。行を HTML 上で挿入・削除すると保存データとの対応がずれる（`memo-app_free-check-seet.html` はドラッグ並び替えを `saveAll()` で都度全保存することで対処済み）
- **Cookie 容量**: ブラウザの Cookie 容量制限（ドメインあたり約 4KB）に注意。メモ入力が多くなる場合は `localStorage` への移行を検討する（`screen-check.html` はすでに `localStorage` を使用）
- **Puppeteer の Chrome パス**: `server.js` と `screenshot.js` ともに macOS の Chrome パスがハードコードされている。異なる OS では修正が必要
- **`screens.csv` の編集**: `screen-check.html` が参照する画面リストを変更する場合は `screens.csv` を直接編集する。CSV パーサーは簡易実装のためダブルクォートやカンマを含む値は非対応
- **`plan.md`**: 実装済み機能の設計メモ。本番コードではなく参照用ドキュメント
