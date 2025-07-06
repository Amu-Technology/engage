'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, User, Shield, AlertTriangle, Scale, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
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
              <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              利用規約
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              最終更新日: 2025年6月28日
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* 第1条（適用） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-3 text-blue-600" />
                第1条（適用）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本利用規約は、amu-lab inc.（以下、「当社」といいます）が提供するアプリケーション「Engage」（以下、「本サービス」といいます）の利用に関する条件を定めるものです。本サービスを利用するすべてのユーザーは、本規約に同意したものとみなします。
              </p>
            </CardContent>
          </Card>

          {/* 第2条（利用登録） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="h-5 w-5 mr-3 text-blue-600" />
                第2条（利用登録）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>本サービスの利用を希望する者は、本規約に同意の上、当社所定の方法により利用登録を行うものとします。</li>
                <li>利用登録者は、本サービスの利用にあたり、Googleアカウントによる認証を行う必要があります。</li>
              </ol>
            </CardContent>
          </Card>

          {/* 第3条（利用料金） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Scale className="h-5 w-5 mr-3 text-blue-600" />
                第3条（利用料金）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本サービスの利用料金は、別途当社が定める料金プランに従うものとします。詳細は当社ウェブサイトの料金ページをご確認ください。
              </p>
            </CardContent>
          </Card>

          {/* 第4条（禁止事項） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3 text-red-600" />
                第4条（禁止事項）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ol>
            </CardContent>
          </Card>

          {/* 第5条（本サービスの提供の停止等） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Shield className="h-5 w-5 mr-3 text-blue-600" />
                第5条（本サービスの提供の停止等）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ol>
            </CardContent>
          </Card>

          {/* 第6条（知的財産権） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-3 text-blue-600" />
                第6条（知的財産権）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本サービスに含まれる知的財産権は、すべて当社または当社にライセンスを許諾している者に帰属します。
              </p>
            </CardContent>
          </Card>

          {/* 第7条（免責事項） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3 text-orange-600" />
                第7条（免責事項）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。
              </p>
            </CardContent>
          </Card>

          {/* 第8条（規約の変更） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-3 text-blue-600" />
                第8条（規約の変更）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
              </p>
            </CardContent>
          </Card>

          {/* 第9条（準拠法・裁判管轄） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Scale className="h-5 w-5 mr-3 text-blue-600" />
                第9条（準拠法・裁判管轄）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </CardContent>
          </Card>

          {/* 連絡先 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                連絡先
              </CardTitle>
            </CardHeader>
            <CardContent>
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
