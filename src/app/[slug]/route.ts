import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const cached = await redis.get(slug)
    if (cached) {
      prisma.link.update({
        where: { slug },
        data: { clicks: { increment: 1 } }
      }).catch(console.error)

      return NextResponse.redirect(cached, { status: 301 })
    }

    const link = await prisma.link.findUnique({
      where: { slug }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      )
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      )
    }

    await redis.setex(slug, 86400, link.originalUrl)
    prisma.link.update({
      where: { slug },
      data: { clicks: { increment: 1 } }
    }).catch(console.error)

    return NextResponse.redirect(link.originalUrl, { status: 301 })

  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}