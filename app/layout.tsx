import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3D坦克大战',
  description: '使用Next.js和Three.js开发的3D坦克对战游戏',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}