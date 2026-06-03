import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { subscription } = await request.json()
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    await sql`
      INSERT INTO push_subscriptions (subscription)
      VALUES (${JSON.stringify(subscription)})
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
