import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '指纹识别系统',
  description: '基于Next.js 14的指纹识别应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full bg-gray-50">{children}</body>
    </html>
  )
}