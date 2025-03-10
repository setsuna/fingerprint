'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Fingerprint, CreditCard, Camera, Code, Download,X } from 'lucide-react'
import { motion } from 'framer-motion'
import PageNavigator from '@/app/components/PageNavigator'

export default function Home() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const features = [
    {
      icon: Fingerprint,
      title: '指纹识别',
      description: '高效准确的指纹采集与识别功能',
      path: '/fingerprint',
      color: 'bg-brand-red'
    },
    {
      icon: CreditCard,
      title: '身份证识别',
      description: '快速读取身份证信息及照片',
      path: '/idcard',
      color: 'bg-green-500',
      soon: false // 修改为false，启用此功能
    },
    {
      icon: Camera,
      title: '高拍仪',
      description: '高清文档扫描与图像处理',
      path: '/camera',
      color: 'bg-purple-500'
    },
    {
      icon: Download,
      title: '驱动下载',
      description: '各类硬件设备的驱动程序下载',
      path: '/driver',
      color: 'bg-blue-500'
    }
  ]
  
  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        {/* 页面标题和查看源码按钮 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>硬件测试平台</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">集成多种硬件测试，简化操作流程</span>
          </div>
          
          <button 
            className="flex items-center text-sm bg-[#2EA44F] hover:bg-[#2C974B] text-white px-3 py-1.5 rounded-full transition-colors"
            onClick={() => setShowModal(true)}
          >
            <Code size={14} className="mr-1" />
            查看源码
          </button>
        </div>
        
        {/* 功能卡片 - 使用table布局以确保在Chrome 102中显示正常 */}
        <div className="w-full overflow-auto" style={{display: 'table'}}>
          <div style={{display: 'table-row-group'}}>
            <div style={{display: 'table-row'}}>
              {features.slice(0, 2).map((feature, index) => (
                <div key={feature.title} style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '50%'}}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <Link
                      href={feature.soon ? '#' : feature.path}
                      className="block"
                    >
                      <div className={`card transition-all hover:shadow-md ${
                        feature.soon ? 'opacity-60' : 'hover:-translate-y-1'
                      }`}>
                        <div className={`${feature.color} h-1.5 w-full rounded-t-2xl`}></div>
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10 mr-4`}>
                              <feature.icon 
                                className={`text-xl ${feature.color.replace('bg-', 'text-')}`} 
                              />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold">{feature.title}</h2>
                              {feature.soon && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                  即将上线
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-6">
                            {feature.description}
                          </p>
                          
                          {!feature.soon ? (
                            <div className="text-brand-red font-medium">
                              开始使用
                              <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                            </div>
                          ) : (
                            <div className="text-gray-400 font-medium">
                              开发中...
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <div style={{display: 'table-row'}}>
              {features.slice(2).map((feature, index) => (
                <div key={feature.title} style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '50%'}}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + 0.1 * index }}
                  >
                    <Link
                      href={feature.soon ? '#' : feature.path}
                      className="block"
                    >
                      <div className={`card transition-all hover:shadow-md ${
                        feature.soon ? 'opacity-60' : 'hover:-translate-y-1'
                      }`}>
                        <div className={`${feature.color} h-1.5 w-full rounded-t-2xl`}></div>
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10 mr-4`}>
                              <feature.icon 
                                className={`text-xl ${feature.color.replace('bg-', 'text-')}`} 
                              />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold">{feature.title}</h2>
                              {feature.soon && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                  即将上线
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-6">
                            {feature.description}
                          </p>
                          
                          {!feature.soon ? (
                            <div className="text-brand-red font-medium">
                              开始使用
                              <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                            </div>
                          ) : (
                            <div className="text-gray-400 font-medium">
                              开发中...
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 页面导航 */}
      <PageNavigator />
      {/* 源码技术选择模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">选择技术栈</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="p-4 border rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center"
                  onClick={() => {
                    alert('查看 React 技术栈源码');
                    setShowModal(false);
                  }}
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">R</div>
                  <span className="font-medium">React</span>
                </button>
                
                <button 
                  className="p-4 border rounded-lg hover:bg-green-50 transition-colors flex flex-col items-center"
                  onClick={() => {
                    alert('查看 Vue 技术栈源码');
                    setShowModal(false);
                  }}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">V</div>
                  <span className="font-medium">Vue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}