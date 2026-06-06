# screen-check.html 実装計画

## 概要

外部サイトのテスト確認用チェックリスト。URLと画面名をCSVで管理し、4項目チェック・メモ・Puppeteerによるスクリーンショット機能を持つ単一HTMLファイル。

---

## ファイル構成

```
03.memo-app/
├── screen-check.html        # メインのチェックリスト画面
├── screens.csv              # URL・画面名データ（編集対象）
├── server.js                # 既存 + /screenshot エンドポイント追加
├── SCREENSHOTS/             # スクショ保存先（自動作成）
└── package.json             # puppeteer 追加
```

---

## screens.csv 形式

```csv
id,name,url
1,トップページ,https://example.com/
2,ログイン画面,https://example.com/login
3,マイページ,https://example.com/mypage
```

- `id`: ナンバリング（スクショファイル名にも使用）
- `name`: 画面名（チェックリストに表示・リンクテキスト）
- `url`: チェック対象の外部URL

---

## screen-check.html

### 機能

- 起動時に `GET /screens.csv` でCSVを fetch して行を動的生成
- 各行の構成:

| No. | 画面名（外部URLリンク） | 予定 | 作業 | 作業終了 | 確認 | メモ | スクショボタン | サムネイル |
|-----|----------------------|------|------|---------|------|------|-------------|--------|

- チェック状態・メモは cookie で自動保存（キー: `sc_checkboxes`, `sc_memos`）
- 📷 ボタンクリック → `POST /screenshot` → 撮影完了後にサムネイル表示・画像リンク付与
- サムネイルの表示状態（画像パス）も cookie で保存し、リロード後も復元

### レイアウト

- CSS Grid または Flexbox
- 画面名カラムは外部リンク（`target="_blank"`）
- メモ欄は1行テキスト input
- サムネイルは最大幅 120px、クリックで画像をフルサイズ表示（`_blank`）

---

## server.js への追加

### `/screens.csv` エンドポイント

- `GET /screens.csv` → `screens.csv` をそのまま返す
- Content-Type: `text/csv`

### `/screenshot` エンドポイント

- `POST /screenshot`
- リクエストボディ: `{ id, name, url }`
- 処理:
  1. `SCREENSHOTS/` フォルダが無ければ作成
  2. Puppeteer でヘッドレスChrome起動
  3. 指定URLを開きフルページスクリーンショット撮影
  4. `SCREENSHOTS/{id}_{name}.png` に保存
  5. ファイルパスをレスポンスで返す
- レスポンス: `{ path: "/SCREENSHOTS/1_トップページ.png" }`
- タイムアウト: 30秒

### `/SCREENSHOTS/` 静的配信

- `SCREENSHOTS/` フォルダを静的ファイルとして配信
- screen-check.html からサムネイルを `<img src="/SCREENSHOTS/...">` で参照

---

## package.json 変更

```json
"dependencies": {
  "puppeteer": "^22.0.0"
}
```

---

## 実装順序

1. `package.json` に puppeteer を追加・インストール
2. `screens.csv` を作成（サンプルデータ入り）
3. `server.js` に `/screens.csv`・`/screenshot`・`/SCREENSHOTS/` を追加
4. `screen-check.html` を作成
5. 動作確認

---

## 注意事項

- 外部サイトのスクショのため、Puppeteer がインターネットにアクセスできる環境が必要
- Cookie の容量制限（約4KB）があるため、行数が多い場合は localStorage に切り替えること
- スクショファイル名に日本語が含まれる場合はURLエンコードに注意（英数字IDをファイル名に使うことで回避可能）
- Puppeteer の初回インストール時は Chromium のダウンロードが走るため時間がかかる
