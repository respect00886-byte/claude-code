# CLAUDE.md

このリポジトリで作業する Claude 向けのガイドです。

## 利用者について

- 利用者は小売業（文房具・キャラクター売り場）の責任者で、エンジニアではありません。
- 説明は**日本語**で、**簡潔に**、新入社員でも分かる言葉で行ってください。IT用語はできるだけ避け、使う場合は一言で補足します。
- コミットメッセージ・コードコメント・README も日本語で書きます（既存の書き方に合わせる）。
- **ファイルを変更する前に、必ず利用者に確認してください。** 「何を・なぜ・どう変えるか」を短く伝え、了承をもらってから作業を始めます。

## リポジトリの構成

1つのリポジトリに、独立した2つのアプリが入っています。どちらもサーバー不要で、データは利用者の端末のブラウザ内にだけ保存されます。

| アプリ | 場所 | 内容 | 主な技術 | データ保存先 |
| --- | --- | --- | --- | --- |
| GymLog | ルート（`src/`） | 筋トレ・体重記録（PWA） | React 19 / TypeScript / Tailwind v4 / Dexie / Recharts | IndexedDB |
| meal-tracker | `meal-tracker/` | 食事・カロリー管理 | React 18 / TypeScript / Vite 5 | localStorage |

- 依存パッケージ（`package.json`）は**別々**です。meal-tracker の作業は `meal-tracker/` に移動してから行います。
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

作業後は、変更したアプリに応じて上記の lint / テスト / ビルドが通ることを確認してください。

## コードの書き方

- Prettier 設定：セミコロンなし、シングルクォート、1行100文字（`.prettierrc`）。meal-tracker はダブルクォート＋セミコロンなので、そちらは既存の書き方に合わせます。
- コメントは日本語で、「なぜそうしているか」を短く書きます。
- スマホで片手操作しやすい画面（大きなボタン、少ないタップ数）を優先します。

## 公開（GitHub Pages）

- `main` に変更が入ると `.github/workflows/deploy.yml` が lint → テスト → 両アプリのビルドを行い、自動公開します。
  - GymLog: https://respect00886-byte.github.io/claude-code/
  - meal-tracker: https://respect00886-byte.github.io/claude-code/meal-tracker/
- 2つのアプリは同じサイトに同居しています。GymLog の Service Worker が meal-tracker を横取りしないよう、`vite.config.ts` の `navigateFallbackDenylist` で除外しています。消さないでください。
