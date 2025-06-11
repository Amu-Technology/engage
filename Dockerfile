FROM node:18.18.0-slim

WORKDIR /app

# OpenSSLのインストール
RUN apt-get update -y && apt-get install -y openssl

# 依存関係のインストール
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# アプリケーションのコピー
COPY . .

# 起動スクリプトをコピーして実行権限を付与
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Prisma Clientの生成
RUN npx prisma generate

# 起動スクリプトを指定
ENTRYPOINT ["./entrypoint.sh"]

# デフォルトのコマンドとして開発サーバーを起動
CMD ["npm", "run", "dev"]