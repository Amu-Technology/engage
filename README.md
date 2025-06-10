# Engage - リード管理システム

このプロジェクトは、Next.jsを使用したリード管理システムです。リードの管理、アクティビティの記録、イベント管理などの機能を提供します。

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth.js
- **UI**: Tailwind CSS, shadcn/ui
- **グラフ**: Recharts
- **パッケージマネージャー**: npm

## 必要な環境

- Node.js: v18.17.0以上
- PostgreSQL: v14以上
- npm: v9.0.0以上
- Docker: v20.10.0以上（Docker環境を使用する場合）

## npmの設定

### インストール

Node.jsをインストールすると、npmも自動的にインストールされます。

### 主なコマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番環境での起動
npm start

# 依存関係の更新
npm update

# 特定のパッケージのインストール
npm install [パッケージ名]

# 開発用パッケージのインストール
npm install --save-dev [パッケージ名]
```

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

### ローカル環境でのセットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd engage
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成し、以下の変数を設定：
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

4. データベースのセットアップ
```bash
npx prisma migrate dev
```

5. 開発サーバーの起動
```bash
npm run dev
```

### Docker環境でのセットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd engage
```

2. 環境変数の設定
`.env.development`ファイルを作成し、以下の変数を設定：
```
DATABASE_URL="postgresql://postgres:postgres@db:5432/engage?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=engage
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

3. Dockerコンテナの起動
```bash
# コンテナのビルドと起動
docker compose up -d --build

# コンテナの状態確認
docker compose ps

# ログの確認
docker compose logs -f
```

4. データベースのマイグレーションとシード
```bash
# マイグレーションの実行
docker compose exec app npx prisma migrate deploy

# シードデータの投入
docker compose exec app npx prisma db seed
```

### シード値の適用について
下記の箇所を変更して、googleアカウントを追加してください。
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

1. `prisma/seed.ts` などのシードスクリプトが存在することを確認してください。
2. `package.json` の `prisma.seed` または `scripts.seed` にシードコマンドが設定されていることを確認してください。
   例：
   ```json
   "prisma": {
     "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
   }
   ```
   または
   ```json
   "scripts": {
     "seed": "prisma db seed"
   }
   ```
3. 下記コマンドでシードを実行します。
   ```bash
   docker compose exec app npx prisma db seed
   ```
4. エラーが出なければ成功です。pgAdminやアプリ画面でデータが入っているか確認してください。

### pgAdminの使用方法

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

アプリケーションは http://localhost:3000 でアクセス可能です。

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

## ライセンス

このプロジェクトは社内利用のみを許可します。
