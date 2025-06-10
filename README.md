# Engage - 政策リード管理システム

このプロジェクトは、Next.jsを使用したリード管理システムです。リードの管理、アクティビティの記録、イベント管理などの機能を提供します。

## 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth.js
- **UI**: Tailwind CSS, shadcn/ui
- **グラフ**: Recharts
- **パッケージマネージャー**: npm

## 必要な環境

- Node.js: v18.18.0以上
- PostgreSQL: v14以上
- npm: v9.0.0以上
- Docker: v20.10.0以上（Docker環境を使用する場合）

## プロジェクト構成

```
engage/
├── app/                    # Next.jsのアプリケーションコード
│   ├── api/               # APIルート
│   ├── dashboard/         # ダッシュボード関連のページ
│   └── providers/         # プロバイダーコンポーネント
├── components/            # 共通コンポーネント
│   ├── ui/               # UIコンポーネント
│   └── analytics/        # 分析関連コンポーネント
├── lib/                   # ユーティリティ関数
├── prisma/               # Prismaスキーマとマイグレーション
└── public/               # 静的ファイル
```

## 主要機能

- リード管理（個人・組織）
- アクティビティ記録
- イベント管理
- グループ管理
- 分析ダッシュボード
- ユーザー管理（管理者向け）


## セットアップ

### Docker環境でのセットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd engage
```

2. 環境変数の設定
`.env.development`ファイルを作成し、以下の変数を設定：
```
# アプリケーション設定
DATABASE_URL="postgresql://postgres:postgres@db:5432/engage?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-very-strong-and-secret-key-for-nextauth

# Google OAuth認証情報（自身のものを設定）
GOOGLE_CLIENT_ID=your-google-client-id-goes-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-goes-here

# Docker Compose用データベース設定
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysecretpassword
POSTGRES_DB=engage
```

3. Dockerコンテナの起動
※Dockerのインストール
```bash
brew install --cask docker
```

```bash
# コンテナのビルドと起動
docker compose up -d --build

# コンテナの状態確認
docker compose ps

# ログの確認
docker compose logs -f
```

4. データベースのマイグレーションとシード  
NEXTAuth.jsで認証した後、データベースのuserテーブルに認証したメールアドレスがあるかどうかを検証してログイン可否を決定しています。  
その為デバッグするには`prisma/seed.ts`のuserテーブルにgoogleアカウントのシード値を追加してください。  
```ts
  // prisma/seed.ts
  // 管理者ユーザーを作成または更新
  await prisma.user.upsert({
    where: {
      email: '***@gmail.com',
    },
    update: {
      name: '****',
      role: 'admin',
      org_id: organization.id,
      updatedAt: new Date(),
    },
    create: {
      name: '****',
      email: '****@gmail.com',
      role: 'admin',
      org_id: organization.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
```
5. マイグレーションとシード値の適用  
```bash
# マイグレーションの実行
docker compose exec app npx prisma migrate deploy

# シードデータの投入
docker compose exec app npx prisma db seed

# ログの確認
docker-compose logs -f app
```
6. アプリの実行  
ログを確認してdockerの起動が確認できたら開発準備完了です。  
アプリケーションは http://localhost:3000 でアクセス可能です。 

### pgAdminでのデータベース確認

1. ブラウザでアクセス
- URL: `http://localhost:5050`
- ログイン情報：
  - メール: `admin@admin.com`
  - パスワード: `admin`

2. データベース接続の設定
- 左側の「Servers」を右クリック → 「Register」→「Server」
- 「General」タブ：
  - Name: `Engage DB`（任意の名前）
- 「Connection」タブ：
  - Host: `db`（Docker Composeのサービス名）
  - Port: `5432`
  - Database: `engage`
  - Username: `postgres`
  - Password: `postgres`

### VS Codeでのデバッグ

1. デバッグの準備
   - VS Codeのデバッグパネルを開く（Cmd/Ctrl + Shift + D）
   - `.vscode/launch.json`が存在することを確認

2. デバッグの開始
   - デバッグパネルで「Next.js: debug」を選択
   - 緑の再生ボタンをクリック
   - ポート9229でデバッガーが接続されます

3. ブレークポイントの設定
   - コードの行番号をクリックしてブレークポイントを設定
   - アプリケーションを操作して、ブレークポイントで処理を停止
   - 変数の値やコールスタックを確認可能

### ホットリロード

- コードの変更は自動的に反映されます
- 変更が反映されない場合は以下を試してください：
  ```bash
  # コンテナの再起動
  docker compose restart app

  # ログの確認
  docker compose logs -f app
  ```

## 開発ガイドライン

- コミットメッセージは日本語で記述
- コンポーネントは`components/`ディレクトリに配置
- APIルートは`app/api/`ディレクトリに配置
- 型定義は各ファイル内で定義

## デプロイ

Vercelを使用してデプロイすることを推奨します：

1. Vercelにプロジェクトをインポート
2. 環境変数を設定
3. デプロイを実行

