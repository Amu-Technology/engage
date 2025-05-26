FROM node:18.17.0-slim

WORKDIR /app

# pnpmのインストール
RUN corepack enable && corepack prepare pnpm@8.0.0 --activate

# 依存関係のインストール
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# アプリケーションのコピー
COPY . .

# データベースのマイグレーション
RUN pnpm prisma generate

# 開発サーバーの起動
CMD ["pnpm", "dev"] 