'use client'

import { useState, useRef, useCallback } from 'react'
import { getFingerprint } from '@/app/services/fingerprintService'

export default function FingerprintScanner() {
  const [fingerImage, setFingerImage] = useState<string>('')
  const [fingerCode, setFingerCode] = useState<string>('')
  const [fingerChar, setFingerChar] = useState<string>('')
  const [imageQuality, setImageQuality] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [qualityThreshold, setQualityThreshold] = useState<string>('40')
  
  const timeCountRef = useRef<number>(0)
  const scanningRef = useRef<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

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
    setResult('')
    
    timeCountRef.current = 0
    scanningRef.current = true
    setIsScanning(true)
    
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
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-wrap gap-6 w-full max-w-4xl justify-center">
        {/* 指纹图像容器 */}
        <div className="w-64 h-72 border border-gray-800 bg-fingerprint-teal flex items-center justify-center overflow-hidden">
          {fingerImage ? (
            <img 
              src={fingerImage} 
              alt="指纹图像" 
              width="256" 
              height="288" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl text-gray-600">
              {isScanning ? '等待指纹...' : '无指纹图像'}
            </div>
          )}
        </div>
        
        {/* 控制面板容器 */}
        <div className="flex-1 min-w-[300px] flex flex-col space-y-3">
          {/* 结果行 */}
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="result" className="font-medium">结果：</label>
            <input 
              type="text" 
              id="result" 
              value={result} 
              readOnly 
              className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 图像质量行 */}
          <div className="flex items-center gap-2">
            <label htmlFor="imageQuality" className="font-medium">图像质量：</label>
            <input 
              type="text" 
              id="imageQuality" 
              value={imageQuality} 
              readOnly 
              className="w-16 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 判断阈值行 */}
          <div className="flex items-center gap-2">
            <label htmlFor="qualityThreshold" className="font-medium">判断阈值：</label>
            <input 
              type="text" 
              id="qualityThreshold" 
              value={qualityThreshold}
              onChange={(e) => setQualityThreshold(e.target.value)}
              className="w-16 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 获取指纹行 */}
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="fingerCode" className="font-medium">获取指纹：</label>
            <input 
              type="text" 
              id="fingerCode" 
              value={fingerCode} 
              readOnly 
              className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden text-ellipsis"
            />
            <button 
              onClick={startFingerprintScan}
              disabled={isScanning}
              className={`px-4 py-2 rounded text-white ${isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            >
              取指纹
            </button>
            {isScanning && (
              <button 
                onClick={cancelScan}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white ml-2"
              >
                取消
              </button>
            )}
          </div>
          
          {/* 指纹特征行 */}
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="fingerChar" className="font-medium">指纹特征：</label>
            <input 
              type="text" 
              id="fingerChar" 
              value={fingerChar} 
              readOnly 
              className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden text-ellipsis"
            />
          </div>
        </div>
      </div>
    </div>
  )
}