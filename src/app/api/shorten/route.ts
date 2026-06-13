import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { url, customSlug } = await req.json()

    // Basic URL validation
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const slug = customSlug || nanoid(7)

    // Check if custom slug is already taken
    if (customSlug) {
      const existing = await prisma.link.findUnique({
        where: { slug }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'This custom slug is already taken' },
          { status: 409 }
        )
      }
    }

    // Save to PostgreSQL
    const link = await prisma.link.create({
      data: { slug, originalUrl: url }
    })

    // Cache in Redis (expires in 24 hours)
    await redis.setex(slug, 86400, url)

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`

    return NextResponse.json({
      shortUrl,
      slug,
      originalUrl: url,
      createdAt: link.createdAt
    })

  } catch (error) {
    console.error('Shorten error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}