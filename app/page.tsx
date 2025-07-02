import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  GlobeIcon
} from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* ヘッダー */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/engage_logo.png" alt="Engageロゴ" width={120} height={51} />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">ログイン</Button>
              </Link>
              <Link href="/dashboard">
                <Button>ダッシュボード</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-12">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <StarIcon className="h-3 w-3 mr-1" />
            選挙活動管理プラットフォーム
          </Badge>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            選挙活動を
            <span className="text-blue-600 dark:text-blue-400">データ駆動</span>
            で
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Engageは、選挙活動を営業活動のように管理し、スケジュールと日報を軸にデータを蓄積・分析する
            包括的な選挙活動管理プラットフォームです。
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="flex items-center">
                無料で始める
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                機能を見る
              </Button>
            </Link>
          </div>
        </section>

        {/* 機能紹介 */}
        <section id="features" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            主要機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>スケジュール管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  有権者との会合、イベント、訪問予定を効率的に管理します。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    カレンダー表示（週・月単位）
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    リマインダー機能
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    予定と実績の比較
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>日報・活動管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  当日の活動記録と有権者の反応を詳細に記録・分析します。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    活動記録の記入
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    有権者反応のスコアリング
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    実績レポートの自動生成
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                  <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>データ分析・可視化</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  蓄積されたデータを分析し、戦略的な意思決定をサポートします。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    エンゲージメント率分析
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    地域別支持率マップ
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    スタッフ活動実績
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* アプリケーションの目的 */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                アプリケーションの目的
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    選挙活動の効率化
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    従来の手作業による選挙活動管理をデジタル化し、スケジュール管理、有権者データの整理、
                    活動記録の蓄積を効率的に行うことで、より効果的な選挙活動を実現します。
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• スケジュールの一元管理</li>
                    <li>• 有権者情報の体系化</li>
                    <li>• 活動実績の可視化</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    データ駆動の意思決定
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    蓄積されたデータを分析することで、地域別の支持率、有権者の関心事、
                    効果的なアプローチ方法を把握し、戦略的な選挙活動を支援します。
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 地域別支持率分析</li>
                    <li>• 有権者エンゲージメント測定</li>
                    <li>• 活動効果の定量評価</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ユーザー体験 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            双方向のユーザー体験
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
                  政治家・スタッフ向け
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  選挙活動の効率化とデータ駆動の意思決定をサポートします。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• スケジュールと日報の一元管理</li>
                  <li>• 有権者データの体系化</li>
                  <li>• 活動実績の可視化と分析</li>
                  <li>• チーム間の情報共有</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2 text-green-600" />
                  有権者向け
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  政治家との接点を増やし、より良い地域づくりに参加できます。
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• イベントへの参加</li>
                  <li>• 政策への提言</li>
                  <li>• 政治家の活動状況確認</li>
                  <li>• 地域コミュニティへの参加</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                今すぐ始めましょう
              </h2>
              <p className="text-blue-100 mb-6">
                選挙活動を次のレベルに引き上げるEngageで、データ駆動の選挙活動を実現してください。
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="flex items-center">
                    無料で始める
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/terms-of-service">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                    利用規約
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GlobeIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold">Engage</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                選挙活動をデータ駆動で管理するプラットフォーム
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">機能</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>スケジュール管理</li>
                <li>日報・活動管理</li>
                <li>データ分析</li>
                <li>ユーザー管理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>ヘルプセンター</li>
                <li>お問い合わせ</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法的情報</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms-of-service" className="hover:text-foreground">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Engage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
