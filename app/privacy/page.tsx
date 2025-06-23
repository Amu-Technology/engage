'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, User, Mail, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const handleGoBack = () => {
    // ブラウザの履歴がある場合は戻る
    if (window.history.length > 1) {
      router.back();
    } else {
      // 履歴がない場合はダッシュボードに戻る
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            前のページに戻る
          </Button>
          
          <div className="text-center">
            <div className="mb-4">
              <Shield className="h-16 w-16 text-blue-600 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              プライバシーポリシー
            </h1>
            <p className="text-gray-600">
              認証情報の利用目的と個人情報の取り扱いについて
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 認証情報の利用目的 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="h-5 w-5 mr-2" />
                Googleアカウント認証について
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">認証が必要な理由</h3>
                <p className="text-sm text-blue-800">
                  イベント参加申込の本人確認と、重複申込の防止のため、Googleアカウントでのログインを必須としています。
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">取得する情報</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">お名前</p>
                      <p className="text-sm text-gray-600">参加申込フォームへの自動入力と申込記録のため</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">メールアドレス</p>
                      <p className="text-sm text-gray-600">参加申込フォームへの自動入力と申込記録のため</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">住所（任意）</p>
                      <p className="text-sm text-gray-600">参加者情報の管理とイベント運営のため（入力は任意です）</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">取得しない情報</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">プロフィール画像</p>
                      <p className="text-sm text-gray-600">取得いたしません</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">その他の個人情報</p>
                      <p className="text-sm text-gray-600">電話番号、生年月日、SNSアカウントなどは取得いたしません</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 利用目的 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                利用目的
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">参加申込の本人確認</p>
                    <p className="text-sm text-gray-600">申込者が実在する人物であることを確認します</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">重複申込の防止</p>
                    <p className="text-sm text-gray-600">同一イベントへの重複申込を防ぎます</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">申込フォームの自動入力</p>
                    <p className="text-sm text-gray-600">お名前とメールアドレスを自動入力し、入力の手間を省きます</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">参加者情報の管理</p>
                    <p className="text-sm text-gray-600">住所を含む参加者情報を適切に管理し、イベント運営に活用します</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">参加状況の管理</p>
                    <p className="text-sm text-gray-600">イベント主催者が参加者を適切に管理できるよう支援します</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* データの取り扱い */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                データの取り扱い
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">保存期間</p>
                    <p className="text-sm text-gray-600">イベント終了後3ヶ月間保存し、その後自動削除されます</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">第三者への提供</p>
                    <p className="text-sm text-gray-600">イベント主催者以外の第三者には提供いたしません</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">データの削除</p>
                    <p className="text-sm text-gray-600">申込完了後、いつでもログアウトできます。データの削除を希望される場合は、イベント主催者までお問い合わせください</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">住所情報の取り扱い</p>
                    <p className="text-sm text-gray-600">住所は任意入力項目です。入力された住所は他の参加者には公開されず、イベント運営の目的でのみ使用されます</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* セキュリティ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                セキュリティ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">暗号化通信</p>
                    <p className="text-sm text-gray-600">すべての通信はSSL/TLSで暗号化されています</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">安全なデータベース</p>
                    <p className="text-sm text-gray-600">個人情報は安全なデータベースに保存されます</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">アクセス制限</p>
                    <p className="text-sm text-gray-600">認証された管理者のみがデータにアクセスできます</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* お問い合わせ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">お問い合わせ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                プライバシーポリシーに関するご質問や、個人情報の削除依頼などがございましたら、
                イベント主催者までお問い合わせください。
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>イベント主催者連絡先</strong><br />
                  各イベントの詳細ページに記載されている連絡先をご確認ください。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* アクション */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGoBack}
              className="px-8"
            >
              前のページに戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 