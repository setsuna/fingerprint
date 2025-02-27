'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// 定义页面配置
const pages = [
  { id: 'home', path: '/', label: '首页' },
  { id: 'fingerprint', path: '/fingerprint', label: '指纹识别' },
  { id: 'idcard', path: '/idcard', label: '身份证识别' },
  { id: 'camera', path: '/camera', label: '高拍仪' },
  { id: 'driver', path: '/driver', label: '驱动下载' }
]

export default function PageNavigator() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 根据当前路径设置初始索引
  useEffect(() => {
    const index = pages.findIndex(page => page.path === pathname)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [pathname])
  
  // 导航到指定页面
  const navigateToPage = (index: number) => {
    setCurrentIndex(index)
    router.push(pages[index].path)
  }
  
  return (
    <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-center">
      <div className="flex flex-wrap items-center justify-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
        <div className="flex flex-wrap space-x-2 space-y-0">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => navigateToPage(index)}
              className={`px-3 py-1 m-1 rounded-full text-sm font-medium transition-colors ${
                currentIndex === index 
                  ? 'bg-brand-red text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}