import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { User, Organization, Lead, Group, ActivityType } from '@prisma/client'

export interface AuthenticatedUser {
  user: User & {
    organization: Organization
  }
}

export function withAuth(
    handler: (req: Request, ctx: AuthenticatedUser) => Promise<NextResponse>
  ): (req: Request) => Promise<NextResponse> {
    return async (request: Request) => {
      try {
        const session = await auth()
        if (!session?.user?.email) {
          return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }
  
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { organization: true }
        })
  
        if (!user?.organization) {
          return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
        }
  
        return handler(request, { user: user as AuthenticatedUser['user'] })
      } catch (error) {
        console.error('認証エラー:', error)
        return NextResponse.json(
          { error: '認証に失敗しました' },
          { status: 500 }
        )
      }
    }
  }
  

export async function checkOrganizationAccess(
  user: AuthenticatedUser,
  resourceId: string,
  resourceType: 'lead' | 'group' | 'activityType'
) {
  const where = {
    id: resourceId,
    organizationId: user.user.organization.id
  }

  let resource: Lead | Group | ActivityType | null = null

  switch (resourceType) {
    case 'lead':
      resource = await prisma.lead.findFirst({ where })
      break
    case 'group':
      resource = await prisma.group.findFirst({ where })
      break
    case 'activityType':
      resource = await prisma.activityType.findFirst({ where })
      break
  }

  if (!resource) {
    return false
  }

  return true
} 