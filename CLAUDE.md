# CLAUDE.md

このリポジトリで作業する Claude 向けのガイドです。

## 利用者について

- 利用者は小売業（文房具・キャラクター売り場）の責任者で、エンジニアではありません。
- 説明は**日本語**で、**簡潔に**、新入社員でも分かる言葉で行ってください。IT用語はできるだけ避け、使う場合は一言で補足します。
- コミットメッセージ・コードコメント・README も日本語で書きます（既存の書き方に合わせる）。
- **ファイルを変更する前に、必ず利用者に確認してください。** 「何を・なぜ・どう変えるか」を短く伝え、了承をもらってから作業を始めます。

## リポジトリの構成

1つのリポジトリに、独立した4つのアプリが入っています。どちらもサーバー不要で、データは利用者の端末のブラウザ内にだけ保存されます。

| アプリ | 場所 | 内容 | 主な技術 | データ保存先 |
| --- | --- | --- | --- | --- |
| GymLog | ルート（`src/`） | 筋トレ・体重記録（PWA） | React 19 / TypeScript / Tailwind v4 / Dexie / Recharts | IndexedDB |
| meal-tracker | `meal-tracker/` | 食事・カロリー管理 | React 18 / TypeScript / Vite 5 | localStorage |
| pop-maker | `pop-maker/` | 売り場POP作成（見出し・補足文を入力） | React 18 / TypeScript / Vite 5 | localStorage（前回の入力・マイフレーズ・まとめて印刷の一覧） |
| sake-log | `sake-log/` | 日本酒の記録（星・ワンタップコメント・写真・お店） | React 18 / TypeScript / Vite 5 / Dexie | IndexedDB（DB名 `sake-log`、写真も Blob で保存） |

- 依存パッケージ（`package.json`）は**別々**です。meal-tracker / pop-maker / sake-log の作業はそれぞれのフォルダに移動してから行います。
- 詳しい機能説明は `README.md` と `meal-tracker/README.md` を参照してください。

### GymLog（`src/`）

- `db/` … Dexie のスキーマ（`db.ts`）、初期種目（`seed.ts`）、メニュー操作（`menu.ts`）
- `lib/` … 集計（推定1RM・ボリューム）、kg/lb 換算、バックアップ、日付など
- `components/` … 共通部品、`pages/` … 各画面
- 重量は**常に kg で保存**し、lb は表示・入力時だけ換算します。
- DB の形を変えるときは `db.ts` の `this.version(n)` を1つ増やし、既存データの移行処理を書きます（利用者のデータを消さないこと）。

### meal-tracker（`meal-tracker/`）

- `src/data/` … チェーン店メニュー（`starterMenu.ts`）、一般食品の目安（`genericFoods.ts`）
- `src/lib/` … カロリー計算・基礎代謝・検索・保存処理
- テストと lint の設定はありません。

### pop-maker（`pop-maker/`）

- メインは見出し・補足文の手入力。定番の言い回しは `src/data/phrases.ts`、マイフレーズは localStorage に保存（`src/lib/storage.ts`）。
- 文字の大きさは `src/lib/drawPop.ts` の `fitTexts` が文字数に合わせて自動で決めます。
- 名刺・A5は「まとめて印刷」でA4用紙に並べて印刷できます（並べ方は `src/lib/batch.ts`、画面は `src/BatchPrint.tsx`）。
- サブ機能の自動生成は AI を使わず、`src/data/templates.ts` の「文のひな形」に商品名（`{商品}`）・特徴（`{特徴}`）を当てはめて候補を作ります（`src/lib/generate.ts`）。
- 書き方は meal-tracker と同じ（ダブルクォート＋セミコロン）。ルートの `npm run lint` の対象にも入ります。

### sake-log（`sake-log/`）

- `src/db.ts` … Dexie のスキーマと保存・削除処理。写真は本体と別の `photos` テーブル（保存用1000px・一覧用320px）
- `src/data/tags.ts` … 定番コメント（香り・味・口当たり・その他）。押す場所を覚えられるよう並びは固定
- `src/lib/` … 検索・絞り込み（`filter.ts`）、写真の縮小（`image.ts`）、バックアップ（`backup.ts`、写真入りの zip）
- 書き方は pop-maker と同じ（ダブルクォート＋セミコロン、`sake-log/.prettierrc`）。ルートの `npm run lint` の対象にも入ります。
- DB の形を変えるときは GymLog と同じく `this.version(n)` を増やし、利用者のデータを消さないこと。
- 同じサイトに他のアプリも同居するので、localStorage のキーには `sake-log:` を付けます。

## よく使うコマンド

ルート（GymLog）:

```bash
npm install
npm run dev      # 開発サーバー
npm run lint     # ESLint
npm test         # Vitest（fake-indexeddb を使用）
npm run build    # 型チェック + ビルド
```

meal-tracker:

```bash
cd meal-tracker && npm install && npm run build
```

pop-maker:

```bash
cd pop-maker && npm install && npm test && npm run build
```

sake-log:

```bash
cd sake-log && npm install && npm test && npm run build
```

作業後は、変更したアプリに応じて上記の lint / テスト / ビルドが通ることを確認してください。

## コードの書き方

- Prettier 設定：セミコロンなし、シングルクォート、1行100文字（`.prettierrc`）。meal-tracker / pop-maker / sake-log はダブルクォート＋セミコロンなので、そちらは既存の書き方に合わせます（ルートの `npm run format` で書き換わらないよう、`.prettierignore` と `sake-log/.prettierrc` で守っています）。
- コメントは日本語で、「なぜそうしているか」を短く書きます。
- スマホで片手操作しやすい画面（大きなボタン、少ないタップ数）を優先します。

## MCPサーバーを足すときのルール

- 設定は `.mcp.json` に書きます（MCP＝Claude に外部の道具をつなぐ仕組み）。
- 公式など、提供元がはっきりした信頼できるものだけを足します。
- 合鍵（APIキー）・パスワードなどの秘密の情報は `.mcp.json` に絶対に書きません（GitHub で誰でも見られるため）。
- 足す・変える前に、必ず利用者に「何を・なぜ」を伝えて了承をもらいます。

## 公開（GitHub Pages）

- PRを出す・更新すると `.github/workflows/check.yml` が4つのアプリの lint / テスト / ビルドだけを行います（公開はしません）。
- `main` に変更が入ると `.github/workflows/deploy.yml` が lint → テスト → 各アプリのビルドを行い、自動公開します。
  - GymLog: https://respect00886-byte.github.io/claude-code/
  - meal-tracker: https://respect00886-byte.github.io/claude-code/meal-tracker/
  - pop-maker: https://respect00886-byte.github.io/claude-code/pop-maker/
  - sake-log: https://respect00886-byte.github.io/claude-code/sake-log/
- 4つのアプリは同じサイトに同居しています。GymLog の Service Worker が meal-tracker / pop-maker / sake-log を横取りしないよう、`vite.config.ts` の `navigateFallbackDenylist` で除外しています。消さないでください。
