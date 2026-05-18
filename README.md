# FAIL DONATE

締切までにタスクを完了できなかったら、失敗がタイムラインに流れるタスク管理アプリ。

## 技術スタック

- Next.js App Router + TypeScript + Tailwind CSS
- Supabase (Postgres)
- Resend (メール)
- Vercel (ホスティング + Cron)

## ローカル起動

```bash
cp .env.example .env.local
# .env.local を編集

npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### リアルタイムタイムライン

- 失敗投稿は `failures` テーブルへ保存し、**Supabase Realtime** で即時反映
- 締切超過タスクの失敗化は、アプリ表示時に `/api/tasks/fail-overdue` を自動実行（Vercel Cron 不要）
- Supabase SQL Editor で `supabase/failures.sql` を実行し、**Replication** で `failures` を有効化

## Supabase 設定

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase/schema.sql` を実行
3. 続けて `supabase/confession.sql` を実行（懺悔室）
4. 続けて `supabase/failures.sql` を実行（リアルタイムタイムライン）
5. **Database → Replication** で `failures` テーブルの Realtime を ON
4. **Settings → API** から URL / anon key / service_role key を `.env.local` に設定
5. （任意）**Database → Replication** で `timeline_posts` の Realtime を有効化

## Vercel デプロイ

1. GitHub に push
2. Vercel で Import
3. Environment Variables に `.env.example` の値を設定（本番 URL は `NEXT_PUBLIC_APP_URL` に反映）
4. Deploy

## フォルダ構成

```
fail-donate/
├─ app/           # ページ & API Routes
├─ components/    # UI
├─ lib/           # Supabase, Resend, 型
├─ supabase/      # schema.sql
├─ .env.example
└─ vercel.json
```
