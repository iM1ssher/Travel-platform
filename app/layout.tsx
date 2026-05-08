// 全站根布局 - 設定全域樣式與 metadata

import "./globals.css"; // 載入 Tailwind CSS 全域樣式
import { AuthProvider } from "./providers";

export const metadata = {
  title: 'AITravel - 智慧行程規劃平台',
  description: '利用 AI 生成行程，輕鬆規劃旅遊路線與景點建議',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      {/* RootLayout 用於包裹所有頁面，保持共用樣式與 metadata */}
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}



