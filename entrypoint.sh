#!/bin/sh
# entrypoint.sh

# データベースの準備が整うまで待機する (より堅牢にするためのオプション)
# これはhealthcheckがあれば不要ですが、念のため
# while ! pg_isready -h db -p 5432 -U postgres; do
#   echo "Waiting for database to be ready..."
#   sleep 2
# done

echo "Running database migrations..."
# 本番環境を想定したマイグレーションコマンド。なければテーブルを作成する。
npx prisma migrate deploy

echo "Starting application..."
# DockerfileのCMDで指定されたコマンド（npm run dev）を実行
exec "$@"

# windowsの場合はこのファイルの改行コードをLFにする
