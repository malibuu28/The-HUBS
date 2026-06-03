import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Hubss',
  description: 'My personal life dashboard — Spirituality · Business · Personal Development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
