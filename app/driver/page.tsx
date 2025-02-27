'use client'

import { Download, Code, FileDown, Monitor, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageNavigator from '@/app/components/PageNavigator'
import { useState } from 'react'

// 驱动信息
const drivers = [
  {
    id: 'fingerprint',
    name: '指纹识别驱动',
    icon: FileDown,
    version: 'v3.2.1',
    date: '2024-12-10',
    size: '12.5 MB',
    os: ['Windows 10', '麒麟2303', 'UOS'],
    description: '指纹识别设备通用驱动程序，支持ZK4500、URU4500等型号。',
    downloadUrl: '#fingerprint-driver'
  },
  {
    id: 'idcard',
    name: '身份证读卡器驱动',
    icon: Monitor,
    version: 'v2.5.0',
    date: '2024-11-25',
    size: '8.3 MB',
    os: ['Windows 10/11', 'Windows 7/8'],
    description: '身份证阅读设备驱动程序，支持华视CVR-100U、德卡D2等型号。',
    downloadUrl: '#idcard-driver'
  },
  {
    id: 'camera',
    name: '高拍仪驱动',
    icon: HardDrive,
    version: 'v1.8.3',
    date: '2024-12-15',
    size: '15.7 MB',
    os: ['Windows 10/11', 'Windows 7/8'],
    description: '高拍仪设备驱动程序，支持良田、方正、紫光等品牌设备。',
    downloadUrl: '#camera-driver'
  }
]

export default function DriverPage() {
  const [selectedOs, setSelectedOs] = useState<string>('Windows 10/11')
  
  // 模拟下载功能
  const handleDownload = (driverId: string) => {
    alert(`开始下载 ${driverId} 驱动程序`)
  }
  
  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        {/* 页面标题和查看源码按钮 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>驱动下载</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">提供各硬件设备的驱动程序下载</span>
          </div>
        </div>
        
        {/* 系统选择过滤器 */}
        <div className="mb-6">
          <div className="card p-4 inline-block">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">选择操作系统:</span>
              <select 
                value={selectedOs}
                onChange={(e) => setSelectedOs(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 py-1 px-2 rounded text-sm focus:outline-none focus:border-brand-red"
              >
                <option value="Windows 10/11">Windows 10</option>
                <option value="Windows 7/8">麒麟2303</option>
                <option value="Windows 7/8">UOS</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 驱动卡片列表 - 使用table布局以确保在Chrome 102中显示正常 */}
        <div className="w-full overflow-auto" style={{display: 'table'}}>
          <div style={{display: 'table-row-group'}}>
            {drivers.map((driver) => (
              <div 
                key={driver.id}
                style={{display: 'table-row'}}
                className="w-full"
              >
                <div style={{display: 'table-cell', paddingBottom: '1rem', width: '100%'}}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="card p-6 h-full"
                  >
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <driver.icon size={28} className="text-brand-red" />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{driver.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{driver.description}</p>
                          </div>
                          
                          <button
                            onClick={() => handleDownload(driver.id)}
                            className="bg-brand-red hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                          >
                            <Download size={16} className="mr-1" />
                            下载
                          </button>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">版本:</span>
                            <span className="font-medium">{driver.version}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">发布日期:</span>
                            <span className="font-medium">{driver.date}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">文件大小:</span>
                            <span className="font-medium">{driver.size}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">支持系统:</span>
                            <span className="font-medium">{driver.os.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 页面导航 */}
      <PageNavigator />
    </div>
  )
}