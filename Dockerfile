# ベースイメージをDebianベースのnode:18.18.0-slimに指定
FROM node:18.18.0-slim

# 作業ディレクトリを設定
WORKDIR /app

# パッケージリストを更新し、必要なビルドツールをインストール
# apk -> apt-get に変更
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# 依存関係のファイルを先にコピーしてキャッシュを有効活用
COPY package*.json ./
COPY prisma ./prisma

# 依存関係をインストール
RUN npm install

# アプリケーションの全ファイルをコピー
COPY . .

# Prisma Clientを生成
RUN npx prisma generate

# 開発サーバーを起動
CMD ["npm", "run", "dev"]