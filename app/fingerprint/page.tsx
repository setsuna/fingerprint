// src/app/fingerprint/page.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { getFingerprint } from '@/app/services/fingerprintService'
import { 
  Fingerprint, 
  Check, 
  RefreshCw, 
  Download,
  Code,
  Clock,
  Layers,
  Settings
} from 'lucide-react'

import PageNavigator from '@/app/components/PageNavigator'

export default function FingerprintPage() {
  const [fingerImage, setFingerImage] = useState<string>('')
  const [fingerCode, setFingerCode] = useState<string>('')
  const [fingerChar, setFingerChar] = useState<string>('')
  const [imageQuality, setImageQuality] = useState<string>('')
  const [result, setResult] = useState<string>('等待操作')
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [qualityThreshold, setQualityThreshold] = useState<string>('40')
  const [captureTime, setCaptureTime] = useState<string>('')
  
  const timeCountRef = useRef<number>(0)
  const scanningRef = useRef<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const startTimeRef = useRef<number>(0)

  // 处理结果代码并转换为对应的消息
  const handleResultCode = useCallback((code: string, count: number) => {
    switch (code) {
      case '1': 
        return '执行成功'
      case '2': 
        return count < 20 
          ? `请按压指纹，等待时间:${count}s` 
          : '等待超时'
      case '3': 
        return '设备生成特征错误'
      case '-99': 
        return '未知异常'
      case '-100': 
        return '参数错误'
      case '-101': 
        return '设备打开失败'
      case '-102': 
        return '设备没有指纹，请按压指纹'
      case '-103': 
        return '设备通讯异常'
      case '-104': 
        return '设备合成模板失败'
      default: 
        return `其他错误 错误代码${code}`
    }
  }, [])

  // 开始扫描指纹
  const startFingerprintScan = useCallback(async () => {
    if (scanningRef.current) return
    
    // 重置状态
    setFingerCode('')
    setFingerChar('')
    setFingerImage('')
    setResult('请按压指纹，等待采集...')
    setCaptureTime('')
    
    timeCountRef.current = 0
    scanningRef.current = true
    setIsScanning(true)
    startTimeRef.current = Date.now()
    
    // 创建 AbortController 用于取消请求
    abortControllerRef.current = new AbortController()
    
    try {
      await scanFingerprint()
    } catch (error) {
      console.error('指纹扫描出错:', error)
      setResult('扫描过程中发生错误')
      scanningRef.current = false
      setIsScanning(false)
    }
  }, [])

  // 递归扫描指纹直到成功或超时
  const scanFingerprint = useCallback(async () => {
    if (!scanningRef.current) return
    
    try {
      // 每次请求增加计数器
      timeCountRef.current++
      
      // 获取指纹数据
      const response = await getFingerprint(
        qualityThreshold, 
        abortControllerRef.current?.signal
      )
      
      // 更新状态
      setImageQuality(response.quality)
      
      if (response.image) {
        setFingerImage(`data:image/png;base64,${response.image}`)
        setFingerCode(response.image)
      }
      
      if (response.characteristic) {
        setFingerChar(response.characteristic)
      }
      
      // 处理结果
      const resultMessage = handleResultCode(response.result, timeCountRef.current)
      setResult(resultMessage)
      
      // 如果成功，停止扫描
      if (response.result === '1') {
        // 计算采集时间
        const endTime = Date.now()
        const duration = ((endTime - startTimeRef.current) / 1000).toFixed(1)
        setCaptureTime(`${duration} 秒`)
        
        scanningRef.current = false
        setIsScanning(false)
        return
      }
      
      // 如果超时，停止扫描
      if (timeCountRef.current >= 20) {
        scanningRef.current = false
        setIsScanning(false)
        return
      }
      
      // 如果失败但未超时，继续扫描
      await scanFingerprint()
    } catch (error) {
      console.error('扫描过程中出错:', error)
      scanningRef.current = false
      setIsScanning(false)
      setResult('扫描出错，请重试')
    }
  }, [qualityThreshold, handleResultCode])

  // 取消扫描
  const cancelScan = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    scanningRef.current = false
    setIsScanning(false)
    setResult('扫描已取消')
  }, [])

  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>指纹识别</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">采集、比对和识别指纹</span>
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
        
        {/* 主要内容区 - 使用table布局以支持Chrome 102 */}
        <div className="w-full overflow-auto" style={{display: 'table'}}>
          <div style={{display: 'table-row-group'}}>
            <div style={{display: 'table-row'}}>
              {/* 指纹采集卡片 */}
              <div style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '25%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Fingerprint size={18} className="mr-2 text-brand-red" />
                      指纹采集
                    </h2>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result === '执行成功' 
                        ? 'bg-green-100 text-green-700' 
                        : isScanning 
                          ? 'bg-blue-100 text-blue-700 animate-pulse'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {result === '执行成功' ? '采集成功' : isScanning ? '采集中...' : '等待操作'}
                    </div>
                  </div>
                  
                  {/* 指纹显示区域 */}
                  <div className="relative bg-gray-50 rounded-lg border border-gray-200 w-full h-48 flex items-center justify-center overflow-hidden mb-4">
                    {fingerImage ? (
                      <img src={fingerImage} alt="指纹图像" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center p-4">
                        <Fingerprint size={48} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-400 text-sm">请按压指纹进行采集</p>
                      </div>
                    )}
                    
                    {isScanning && (
                      <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <button
                    onClick={startFingerprintScan}
                    disabled={isScanning}
                    className={`w-full ${
                      isScanning 
                        ? 'bg-gray-200 text-gray-500' 
                        : 'bg-brand-red text-white hover:bg-red-600'
                    } font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors`}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        采集中...
                      </>
                    ) : (
                      <>
                        <Fingerprint size={16} className="mr-2" />
                        采集指纹
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* 状态信息卡片 */}
              <div style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '25%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Layers size={18} className="mr-2 text-blue-500" />
                    状态信息
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        操作结果
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                        {result}
                      </div>
                    </div>
                    
                    <div style={{display: 'table', width: '100%'}}>
                      <div style={{display: 'table-row'}}>
                        <div style={{display: 'table-cell', paddingRight: '0.75rem', width: '50%'}}>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            指纹质量
                          </label>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-medium">
                            {imageQuality || '- -'}
                          </div>
                        </div>
                        
                        <div style={{display: 'table-cell', width: '50%'}}>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            采集时间
                          </label>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-medium flex items-center">
                            {captureTime ? (
                              <>
                                <Clock size={14} className="mr-1 text-gray-400" />
                                {captureTime}
                              </>
                            ) : '- -'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {fingerChar && result === '执行成功' && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                        <div className="flex items-start">
                          <Check size={16} className="text-green-500 mr-2 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-green-700 text-sm">指纹采集成功</h3>
                            <div className="flex mt-2">
                              <button 
                                className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded-md flex items-center mr-2"
                                onClick={() => {
                                  // 创建一个blob对象
                                  const blob = new Blob([fingerChar], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  
                                  // 创建一个a标签用于下载
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = 'fingerprint_feature.txt';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                <Download size={12} className="mr-1" />
                                下载特征
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 参数设置卡片 */}
              <div style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '25%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings size={18} className="mr-2 text-gray-600" />
                    参数设置
                  </h2>
                  
                  <div className="mb-4">
                    <label htmlFor="threshold" className="block text-sm font-medium text-gray-500 mb-2">
                      判断阈值: {qualityThreshold}
                    </label>
                    <input
                      type="range"
                      id="threshold"
                      min="10"
                      max="100"
                      value={qualityThreshold}
                      onChange={(e) => setQualityThreshold(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>低</span>
                      <span>高</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-5">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">设备状态</div>
                      <div className="font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        已连接
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">固件版本</div>
                      <div className="font-medium">v2.5.1</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 使用指南卡片 */}
              <div style={{display: 'table-cell', paddingBottom: '1.5rem', width: '25%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Fingerprint size={18} className="mr-2 text-green-600" />
                    使用指南
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 text-gray-600 font-medium text-sm">1</div>
                      <p className="text-sm text-gray-600">确保指纹设备已正确连接</p>
                    </div>
                    
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 text-gray-600 font-medium text-sm">2</div>
                      <p className="text-sm text-gray-600">调整合适的判断阈值（推荐值: 40-60）</p>
                    </div>
                    
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 text-gray-600 font-medium text-sm">3</div>
                      <p className="text-sm text-gray-600">点击"采集指纹"按钮</p>
                    </div>
                    
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 text-gray-600 font-medium text-sm">4</div>
                      <p className="text-sm text-gray-600">将手指平稳放置在指纹采集区上</p>
                    </div>
                    
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 text-gray-600 font-medium text-sm">5</div>
                      <p className="text-sm text-gray-600">等待系统采集完成，查看结果</p>
                    </div>
                  </div>
                  
                  {fingerChar && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        指纹特征片段
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 h-12 overflow-hidden text-xs text-gray-500 font-mono">
                        {fingerChar ? fingerChar.substring(0, 100) + '...' : '- -'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 页面导航器 */}
      <PageNavigator />
    </div>
  )
}