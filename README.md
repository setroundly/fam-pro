# まるっとfam proレシピ

献立の便利さと、家族の思い出が積み重なる家庭向けレシピ帳アプリ。  
スマホのブラウザから使え、ホーム画面に追加してアプリのようにも利用できます。

## できること

- **家族で共有** — 招待コード（6文字）で家族を作成・参加
- **レシピの保存** — 材料・手順・思い出メモ・写真・カテゴリ・イベントタグ
- **食卓の記録** — 「今日作った」を記録し、カレンダーで振り返り
- **献立サポート** — 検索・カテゴリ絞り込み・久しぶりの味の提案
- **家族の声** — 「作ってほしい」リクエスト、記念日・誕生日のしるし
- **リンク集** — 参考サイトなど URL を家族で共有
- **管理画面** — `/admin` で不適切なレシピの削除

## 技術スタック

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage)
- Vercel（推奨ホスティング）

---

## 1. ローカルで動かす

```bash
cp .env.example .env.local
# .env.local を編集

npm install
npm run dev
```

http://localhost:3000 を開く。

---

## 2. Supabase の準備

### 新規プロジェクト（初めて）

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase/schema.sql` を **1回だけ** 実行
3. **Settings → API** から URL / anon key / service_role key をコピー

### すでに DB がある場合

`schema.sql` は実行しない（`users already exists` エラーになります）。

代わりに **`supabase/既存DB用-全機能追加.sql`** を実行してください。

---

## 3. 環境変数

`.env.local`（ローカル）または Vercel の Environment Variables に設定します。

| 変数 | 必須 | 説明 |
|------|------|------|
| `NEXT_PUBLIC_APP_NAME` | | アプリ名（省略可） |
| `NEXT_PUBLIC_APP_URL` | 本番推奨 | 公開 URL（例: `https://your-app.vercel.app`） |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service role key（サーバー API 用・秘密） |
| `ADMIN_SECRET` | ✅ | 管理画面パスワード（16文字以上・秘密） |

`NEXT_PUBLIC_APP_URL` を Vercel に設定すると、OGP・サイトマップ・PWA の URL が正しくなります。  
未設定でも Vercel では `VERCEL_URL` から自動推定します。

---

## 4. Vercel にデプロイ（本番公開）

### 手順

1. **GitHub に push**（新しいリポジトリ推奨）
2. [vercel.com](https://vercel.com) → **Add New Project** → リポジトリを Import
3. **Environment Variables** に上記の値をすべて設定
4. **Deploy**

### デプロイ後チェックリスト

- [ ] トップページが開く
- [ ] 「家族」タブで家族を作成できる
- [ ] レシピの追加・検索ができる
- [ ] 写真付きレシピが保存できる（Storage バケット `recipe-photos` があること）
- [ ] スマホで「ホーム画面に追加」できる
- [ ] `/admin` に `ADMIN_SECRET` でログインできる

### カスタムドメイン（任意）

Vercel → Project → **Settings → Domains** でドメインを追加し、  
`NEXT_PUBLIC_APP_URL` を `https://your-domain.com` に更新して再デプロイ。

---

## 5. スマホでアプリのように使う

- **iPhone (Safari):** 共有 → 「ホーム画面に追加」
- **Android (Chrome):** メニュー → 「アプリをインストール」または「ホーム画面に追加」

初回アクセス時に画面下にヒントが表示されます。

---

## 6. 管理画面

`/admin` — `ADMIN_SECRET` でログイン。不適切なレシピを削除できます。

---

## フォルダ構成

```
├─ app/              ページ & API Routes
├─ components/       UI
├─ lib/              Supabase, 型, ユーティリティ
├─ public/icons/     PWA アイコン
├─ supabase/
│   ├─ schema.sql                 新規DB用（初回のみ）
│   └─ 既存DB用-全機能追加.sql    既存DB用マイグレーション
└─ .env.example
```

## 開発コマンド

```bash
npm run dev      # 開発サーバー
npm run build    # 本番ビルド
npm run start    # 本番サーバー（build 後）
npm run lint     # ESLint
```

---

## 注意（セキュリティ）

- `SUPABASE_SERVICE_ROLE_KEY` と `ADMIN_SECRET` は **絶対に Git に含めない**
- 本番では `ADMIN_SECRET` を推測されにくいランダム文字列にする
- 現在 RLS は開発しやすさ優先の設定です。公開運用を拡大する場合は Supabase のポリシー見直しを検討してください
