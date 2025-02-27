'use client'

import { Camera, AlertTriangle, Code } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageNavigator from '@/app/components/PageNavigator'

export default function CameraPage() {
  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        {/* 页面标题和查看源码按钮 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>高拍仪</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">文档扫描与图像处理</span>
          </div>
          
          <button 
            className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
            onClick={() => {
              alert('查看源代码功能');
            }}
          >
            <Code size={14} className="mr-1" />
            查看源码
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="card max-w-lg w-full p-8 text-center"
          >
            <AlertTriangle className="text-yellow-500 w-16 h-16 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">功能开发中</h2>
            <p className="text-gray-600 mb-8">
              高拍仪功能即将上线，敬请期待！
            </p>
            <Link 
              href="/" 
              className="bg-brand-red hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
            >
              <span>返回首页</span>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* 页面导航 */}
      <PageNavigator />
    </div>
  )
}