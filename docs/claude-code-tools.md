# Claude Code ツール・スキル一覧

このドキュメントは `/context` コマンドの出力をもとに、Claude Code セッションで利用できる
ツール群とスキル群を分類し、見やすい表としてまとめたものです。後から参照できるよう
プロジェクトフォルダ (`docs/claude-code-tools.md`) に保存しています。

作成日: 2026-09-15

---

## 1. 全体構成

Claude Code が使う機能は、大きく4つのグループに分かれます。

| グループ | 説明 |
|---|---|
| **標準ツール(常時読み込み)** | セッション開始時から常に使える基本ツール(ファイル操作・検索・実行など) |
| **遅延読み込みツール(System tools deferred)** | 名前だけが提示され、必要になったときに `ToolSearch` でスキーマを読み込んで使う組み込みツール |
| **MCPツール** | 外部サービス(GitHub、Google Calendar、Claude Code Remote など)と連携する追加ツール。こちらも一部は遅延読み込み |
| **スキル(Skills)** | `/コマンド名` や自動判定で呼び出す、特定作業向けの手順書(プレイブック) |

---

## 2. 標準ツール(常時読み込み)

| ツール名 | 用途 |
|---|---|
| `Agent` | サブエージェントを起動し、複雑・独立したタスクを委任する |
| `Artifact` | HTMLファイルを「Artifact」として公開(Webページ・ダッシュボード等) |
| `AskUserQuestion` | ユーザーにしか判断できない選択をたずねる(選択肢付き) |
| `Bash` | シェルコマンドを実行する |
| `Edit` | 既存ファイルの一部を正確に置換する |
| `Glob` | ファイル名パターンで検索する |
| `Grep` | ファイル内容を正規表現で検索する(ripgrepベース) |
| `ListAgents` | メッセージを送れる相手(サブエージェント・チームメイト等)を一覧表示する |
| `Read` | ファイル(テキスト・画像・PDF・Notebook等)を読み込む |
| `ReadNotifications` | 保留中の通知(GitHub活動・スケジュール起動・他セッションからのメッセージ)を読む |
| `ReportFindings` | コードレビュー結果を構造化して報告する |
| `ScheduleWakeup` | `/loop` の動的モードで次回の再開タイミングを予約する |
| `SendUserFile` | 生成物や成果物をユーザーに送付する |
| `Skill` | 登録済みスキルを呼び出す |
| `SuggestSkills` | タスクに合いそうな未導入スキルを提案する |
| `ToolSearch` | 遅延読み込みツールのスキーマを検索・取得する |
| `Write` | 新規ファイル作成・全面書き換えを行う |

---

## 3. 遅延読み込みツール(System tools deferred)

`ToolSearch` で読み込むまではスキーマが展開されない組み込みツールです。

| ツール名 | 想定用途 |
|---|---|
| `CronCreate` / `CronDelete` / `CronList` | 定期実行ジョブ(Cron)の作成・削除・一覧 |
| `DesignSync` | デザインキャンバス(Claude Design)との同期 |
| `EnterPlanMode` / `ExitPlanMode` | 「計画モード」への出入り(実装前に計画を提示し承認を得る) |
| `EnterWorktree` / `ExitWorktree` | Git worktree(隔離作業ツリー)への出入り |
| `ListConnectors` / `SuggestConnectors` | 利用可能な外部コネクタの一覧・提案 |
| `ListMcpResourcesTool` / `ReadMcpResourceDirTool` / `ReadMcpResourceTool` | MCPサーバーが公開するリソースの一覧・読み込み |
| `ListPlugins` / `SearchPlugins` / `SuggestPluginInstall` | プラグインの一覧・検索・導入提案 |
| `ListSkills` / `SearchSkills` | 導入済み・検索可能なスキルの一覧 |
| `Monitor` | バックグラウンドプロセスのイベントをストリーム監視する |
| `NotebookEdit` | Jupyter Notebook (.ipynb) の編集 |
| `PushNotification` | プッシュ通知の送信 |
| `SearchMcpRegistry` | MCPサーバーのレジストリ検索 |
| `SendMessage` | 他のセッション/エージェントへメッセージ送信 |
| `TaskCreate` / `TaskGet` / `TaskList` / `TaskOutput` / `TaskStop` / `TaskUpdate` | タスク管理(作成・取得・一覧・出力確認・停止・更新) |
| `WebFetch` | 指定URLの内容を取得する |
| `WebSearch` | Web検索を行う |

---

## 4. MCPツール

### 4-1. Claude Code Remote(セッション・環境管理)

| ツール名 | 用途 |
|---|---|
| `add_repo` | セッションにGitHubリポジトリを追加する |
| `archive_session` / `unarchive_session` | セッションのアーカイブ・復元 |
| `create_session` | 新しいリモートセッションを作成する |
| `create_trigger` / `update_trigger` / `delete_trigger` / `fire_trigger` / `list_triggers` | 定期実行(Routine)の作成・更新・削除・即時実行・一覧 |
| `get_session` / `list_sessions` | セッション情報の取得・一覧 |
| `interrupt_session` | 実行中セッションへの割り込み停止 |
| `list_environments` | 利用可能な実行環境の一覧 |
| `list_repos` | アクセス可能なリポジトリの一覧 |
| `register_repo_root` | クローン済みリポジトリをセッションに登録する |
| `send_later` | 未来の時刻に自分自身へメッセージを予約送信する |
| `set_session_tags` / `set_session_title` | セッションのタグ付け・タイトル変更 |
| `subscribe_pr_activity` / `unsubscribe_pr_activity` | PRのCI・レビュー活動の購読・解除 |
| `unwatch_url` | Webhook監視の停止 |
| `watch_url` | 外部サービスからのWebhook通知を受け取るURLを発行 |

### 4-2. GitHub(コード・PR・Issue操作)

| ツール名 | 用途 |
|---|---|
| `get_me` | 認証中のGitHubユーザー情報を取得 |
| `create_pull_request` / `update_pull_request` / `merge_pull_request` | PRの作成・更新・マージ |
| `pull_request_read` / `list_pull_requests` / `search_pull_requests` | PR情報の取得・一覧・検索 |
| `pull_request_review_write` / `add_comment_to_pending_review` | PRレビューの作成・コメント追加 |
| `add_reply_to_pull_request_comment` / `resolve_review_thread` / `unresolve_review_thread` | レビュースレッドへの返信・解決・再オープン |
| `request_copilot_review` | Copilotレビューのリクエスト |
| `update_pull_request_branch` | PRブランチの更新(マージ元反映) |
| `enable_pr_auto_merge` / `disable_pr_auto_merge` | 自動マージの有効化・無効化 |
| `issue_read` / `issue_write` / `list_issues` / `search_issues` | Issueの取得・作成編集・一覧・検索 |
| `add_issue_comment` | Issueへのコメント追加 |
| `list_issue_fields` / `list_issue_types` | Issueのフィールド・タイプ一覧 |
| `sub_issue_write` | サブIssueの操作 |
| `create_branch` / `list_branches` | ブランチの作成・一覧 |
| `create_or_update_file` / `delete_file` / `push_files` | リポジトリ内ファイルの作成更新・削除・複数ファイルpush |
| `get_file_contents` / `search_code` | ファイル内容取得・コード検索 |
| `get_commit` / `list_commits` / `search_commits` | コミット情報取得・一覧・検索 |
| `get_check_run` / `get_job_logs` | CIチェック結果・ジョブログの取得 |
| `actions_get` / `actions_list` / `actions_run_trigger` | GitHub Actionsの取得・一覧・手動実行 |
| `create_repository` / `fork_repository` | リポジトリの新規作成・フォーク |
| `get_label` | ラベル情報取得 |
| `get_latest_release` / `get_release_by_tag` / `list_releases` | リリース情報の取得・一覧 |
| `get_tag` / `list_tags` | タグ情報の取得・一覧 |
| `get_teams` / `get_team_members` / `list_repository_collaborators` | チーム・コラボレーター情報 |
| `search_repositories` / `search_users` | リポジトリ・ユーザー検索 |
| `run_secret_scanning` | シークレットスキャンの実行 |
| `subscribe_pr_activity` / `unsubscribe_pr_activity` | (GitHub版)PR活動の購読・解除 |

### 4-3. Google Calendar

| ツール名 | 用途 |
|---|---|
| `list_calendars` | カレンダー一覧の取得 |
| `list_events` / `search_events` / `get_event` | 予定の一覧・検索・詳細取得 |
| `create_event` / `update_event` / `delete_event` | 予定の作成・更新・削除 |
| `respond_to_event` | 招待への出欠回答 |
| `suggest_time` | 空き時間の提案 |

---

## 5. スキル(Skills)一覧

| スキル名 | 提供元 | 用途 |
|---|---|---|
| `session-start-hook` | ユーザー | Claude Code on the web 用の起動フック作成 |
| `design` | 組み込み | デザインキャンバス(Artifact)の作成 |
| `dataviz` | 組み込み | グラフ・ダッシュボード等データ可視化の作成 |
| `artifact-design` | 組み込み | Artifact作成前のデザイン指針 |
| `artifact-diagramming` | 組み込み | Artifact内での図解・ダイアグラム作成 |
| `artifact-capabilities` | 組み込み | Artifactにランタイム機能(DB・ユーザー識別等)を付与 |
| `update-config` | 組み込み | `settings.json` の設定変更(権限・フック・環境変数) |
| `keybindings-help` | 組み込み | キーボードショートカットのカスタマイズ |
| `code-review` | 組み込み | 差分やPRのコードレビュー |
| `simplify` | 組み込み | コードの簡潔化・重複排除・効率化 |
| `fewer-permission-prompts` | 組み込み | 許可プロンプトを減らす設定の自動追加 |
| `loop` | 組み込み | プロンプトやコマンドを一定間隔で繰り返し実行 |
| `claude-api` | 組み込み | Claude API / Anthropic SDK のリファレンス |
| `run` | 組み込み | プロジェクトのアプリを起動して動作確認 |
| `init` | 組み込み | `CLAUDE.md` の初期作成 |
| `security-review` | 組み込み | 変更差分のセキュリティレビュー |
| `anthropic-skills:docx` | claude.ai同期 | Word文書(.docx/.dotx)の作成・編集 |
| `anthropic-skills:import-memory` | claude.ai同期 | 他AIからのメモリインポート |
| `anthropic-skills:morning` | claude.ai同期 | 朝のブリーフィング表示・設定 |
| `anthropic-skills:pdf` | claude.ai同期 | PDFの作成・編集・抽出・結合等 |
| `anthropic-skills:pptx` | claude.ai同期 | PowerPoint(.pptx/.potx)の作成・編集 |
| `anthropic-skills:skill-creator` | claude.ai同期 | 新規スキルの作成・改善・評価 |
| `anthropic-skills:xlsx` | claude.ai同期 | スプレッドシート(.xlsx等)の作成・編集 |

---

## 補足

- 「遅延読み込み」ツールは、実際に使う直前に `ToolSearch` でスキーマを取得してから呼び出す方式です。これにより、使わないツールの定義文でコンテキスト(トークン)を消費しない設計になっています。
- MCP(Model Context Protocol)は、外部サービスをツールとしてClaude Codeに接続するための標準規格です。
- 上記は 2026-09-15 時点でこのセッションに接続されていたツール・スキール構成のスナップショットであり、環境や連携設定によって変動します。
