import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const content = readFileSync(
      join(process.cwd(), 'public', '.well-known', 'apple-developer-merchantid-domain-association'),
      'utf-8'
    )
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return new NextResponse('not found', { status: 404 })
  }
}
