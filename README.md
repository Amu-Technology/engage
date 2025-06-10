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

- Node.js: v18.17.0以上
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
DATABASE_URL="postgresql://postgres:mysecretpassword@db:5432/engage"
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
```bash
docker-compose up -d --build
```
※Dockerのインストール
```bash
brew install --cask docker
```

その他のDockerコマンド
```bash
# コンテナの停止
docker-compose down

# ログの確認
docker-compose logs -f app
```

4. データベースのマイグレーション
```bash
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

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

