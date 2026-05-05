# Local Storage メモアプリ

ブラウザの localStorage にデータを保存する、シンプルな作業管理ツール集です。  
Node.js の静的ファイルサーバで動作し、インストール後すぐにブラウザから使えます。

## 特徴

- **作業チェックリスト** — 予定・作業・作業終了・確認の4項目チェックとメモを管理
- **スクリーンチェックリスト** — CSV で管理した外部サイト URL を一覧表示し、チェック・メモ・スクリーンショット撮影ができる
- チェック状態・メモは localStorage に自動保存（ページリロード後も復元）
- スクリーンショットは Puppeteer（ヘッドレス Chrome）で撮影し `SCREENSHOTS/` フォルダに保存

## 必要環境

- **Node.js** 18 以上
- **Google Chrome**（スクリーンショット機能を使う場合）

## インストール・起動

```bash
git clone https://github.com/shinjixxxxx/memo-app-local_strage.git
cd memo-app-local_strage
npm install
npm run server
```

ブラウザで `http://localhost:2001/index.html` を開いてください。

## 各ツールの使い方

### 作業チェックリスト (`memo-app.html`)

- 各行に「予定・作業・作業終了・確認」のチェックボックスとメモ欄があります
- チェック・メモ入力は即座に localStorage へ自動保存されます

### スクリーンチェックリスト (`screen-check.html`)

1. `screens.csv` に確認したい画面の ID・画面名・URL を記載します

```csv
id,name,url
1,トップページ,https://example.com/
2,ログイン画面,https://example.com/login
```

2. `http://localhost:2001/screen-check.html` を開くと一覧が表示されます
3. 画面名のリンクをクリックすると対象 URL をブラウザで開きます
4. 📷 撮影ボタンでスクリーンショットを撮影し、サムネイルを行内に表示します
   - 保存先: `SCREENSHOTS/{id}_{画面名}.png`

## ファイル構成

```
.
├── index.html                     # ツール一覧ページ
├── memo-app.html                  # 作業チェックリスト
├── memo-app_free-check-seet.html  # フリー版チェックリスト（行追加・並び替え対応）
├── screen-check.html              # スクリーンチェックリスト
├── screens.csv                    # スクリーンチェック用 URL 一覧（編集して使う）
├── server.js                      # 静的ファイルサーバ（ポート 2001）
├── SCREENSHOTS/                   # スクリーンショット保存先（自動生成）
└── package.json
```

## ライセンス

[MIT](./LICENSE) © 2025 shinjixxxxx
