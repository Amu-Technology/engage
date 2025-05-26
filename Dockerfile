FROM node:18.17.0-slim

WORKDIR /app

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# データベースのマイグレーション
RUN npx prisma generate

# 開発サーバーの起動
CMD ["npm", "run", "dev"] 