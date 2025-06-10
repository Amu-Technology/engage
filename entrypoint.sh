#!/bin/bash
# entrypoint.sh

# データベースのマイグレーション
echo "Running database migrations..."
npx prisma migrate deploy

# 開発サーバーの起動
echo "Starting development server..."
npm run dev