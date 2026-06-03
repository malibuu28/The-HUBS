import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dashboard (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    const rows = await sql`
      SELECT data FROM dashboard WHERE user_id = 'shayonna'
    `
    if (rows.length === 0) {
      await sql`
        INSERT INTO dashboard (user_id, data) VALUES ('shayonna', '{}')
      `
      return NextResponse.json({})
    }
    return NextResponse.json(rows[0].data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await sql`
      INSERT INTO dashboard (user_id, data) 
      VALUES ('shayonna', ${JSON.stringify(data)})
      ON CONFLICT (user_id) 
      DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = NOW()
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
