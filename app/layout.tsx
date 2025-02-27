import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '硬件综合平台',
  description: '集成指纹识别、身份证识别和高拍仪等功能的硬件测试平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full bg-slate-50">
        <div className="relative h-screen w-full overflow-hidden bg-dot-pattern">
          {children}
        </div>
      </body>
    </html>
  )
}