import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      'https://the-hubs.vercel.app?error=' + (error || 'no_code')
    )
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (tokens.error) {
      return NextResponse.redirect(
        'https://the-hubs.vercel.app?error=' + tokens.error
      )
    }

    await sql`
      CREATE TABLE IF NOT EXISTS google_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        tokens JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      INSERT INTO google_tokens (user_id, tokens)
      VALUES ('shayonna', ${JSON.stringify(tokens)})
      ON CONFLICT (user_id)
      DO UPDATE SET tokens = ${JSON.stringify(tokens)}, updated_at = NOW()
    `

    return NextResponse.redirect(
      'https://the-hubs.vercel.app?calendar=connected'
    )
  } catch (error: any) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(
      'https://the-hubs.vercel.app?error=server_error'
    )
  }
}
