'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, User, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            前のページに戻る
          </Button>
          
          <div className="text-center">
            <div className="mb-4 inline-block p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              プライバシーポリシー
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              最終更新日: 2025年6月28日
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. はじめに */}
          <p className="text-center text-gray-700 dark:text-gray-300">
            amu-lab inc.（以下、「当社」といいます）は、当社が提供する政務活動支援アプリケーション「Engage」（以下、「本サービス」といいます）における、ユーザーの個人情報およびGoogleユーザーデータの取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます）を定めます。
          </p>

          {/* 2. 取得する情報と利用目的 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="h-5 w-5 mr-3 text-blue-600" />
                取得する情報と利用目的
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Googleアカウント情報</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li><span className="font-medium">取得する情報:</span> 氏名、メールアドレス、プロフィール画像、Googleアカウントの一意のID。</li>
                  <li><span className="font-medium">利用目的:</span> 本サービスへのログイン認証、ユーザーアカウントの識別、およびユーザーへの連絡のため。</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Google APIから取得する情報 (Gmail API)</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li><span className="font-medium">アクセスするスコープ:</span> `https://www.googleapis.com/auth/gmail.send`</li>
                  <li><span className="font-medium">利用目的:</span> 本サービスの「一斉メール送信機能」において、**ユーザーの操作に基づき、ユーザー自身のGmailアカウントから**、ユーザーが指定した複数のリード（連絡先）に対してメールを送信するため。</li>
                  <li><span className="font-medium">情報の取り扱い:</span> 本サービスがGmailの受信トレイを読み取ったり、メール内容を保存したり、ユーザーの許可なくメールを送信することはありません。メールの送信は、ユーザーが内容を確認し、送信ボタンを押したときにのみ実行されます。</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">ユーザーが本サービスに入力する情報</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li><span className="font-medium">取得する情報:</span> リード（支援者）情報（氏名、連絡先等）、活動記録、イベント情報、入金情報など。</li>
                    <li><span className="font-medium">利用目的:</span> 政務活動を円滑化するためのデータ管理、可視化、次アクションの提案など、本サービスのコア機能を提供するため。</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. 情報の第三者への提供 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                情報の第三者への提供
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">当社は、以下の場合を除き、取得した情報をユーザーの同意なく第三者に提供することはありません。</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>法令に基づく場合。</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき。</li>
                <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合。</li>
              </ul>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                EngageのGoogle APIから受け取った情報の使用および他のアプリへの転送は、限定的な使用に関する要件を含め、<a href="https://developers.google.com/terms/api-services-user-data-policy?hl=ja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google APIサービスのユーザーデータに関するポリシー</a>を遵守します。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4. データの安全管理措置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Lock className="h-5 w-5 mr-3 text-blue-600" />
                データの安全管理措置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                当社は、取り扱う個人データの漏えい、滅失またはき損の防止その他の個人データの安全管理のために必要かつ適切な措置を講じます。データベースへのアクセスは厳格に管理され、通信は暗号化されています。
              </p>
            </CardContent>
          </Card>
          
          {/* 5. お問い合わせ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">お問い合わせ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                本ポリシーに関するご質問や、個人情報の削除依頼などがございましたら、以下の連絡先までお問い合わせください。
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>株式会社 Amu-Technologies</strong><br />
                  連絡先: <a href="mailto:info@amu-lab.com" className="text-blue-600 hover:underline">info@amu-lab.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}