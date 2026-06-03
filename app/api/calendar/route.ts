import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const rows = await sql`
      SELECT tokens FROM google_tokens WHERE user_id = 'shayonna'
    `

    if (rows.length === 0) {
      return NextResponse.json({ events: [], connected: false })
    }

    let tokens = rows[0].tokens

    // Refresh token if expired
    if (tokens.refresh_token) {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokens.refresh_token,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      })
      const refreshed = await refreshRes.json()
      tokens = { ...tokens, ...refreshed }
      await sql`
        UPDATE google_tokens 
        SET tokens = ${JSON.stringify(tokens)}, updated_at = NOW()
        WHERE user_id = 'shayonna'
      `
    }

    const now = new Date()
    const weekLater = new Date()
    weekLater.setDate(weekLater.getDate() + 7)

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: weekLater.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '20',
      }),
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    )

    const calData = await calRes.json()
    const events = calData.items?.map((e: any) => ({
      id: e.id,
      title: e.summary,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      location: e.location,
    })) || []

    return NextResponse.json({ events, connected: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ events: [], connected: false })
  }
}
