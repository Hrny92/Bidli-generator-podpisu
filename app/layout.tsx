import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Generátor e-mailových podpisů',
  description: 'Generátor firemních podpisů pro e-mailové klienty',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  )
}
