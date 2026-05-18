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

### Cron の手動実行（締切超過 → failed）

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/check-failures
```

## Supabase 設定

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase/schema.sql` を実行
3. 続けて `supabase/confession.sql` を実行（懺悔室）
4. **Settings → API** から URL / anon key / service_role key を `.env.local` に設定
5. （任意）**Database → Replication** で `timeline_posts` の Realtime を有効化

## Vercel デプロイ

1. GitHub に push
2. Vercel で Import
3. Environment Variables に `.env.example` の値を設定（本番 URL は `NEXT_PUBLIC_APP_URL` に反映）
4. Deploy

Cron は `vercel.json` で 5 分ごとに `/api/cron/check-failures` を実行します。

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
