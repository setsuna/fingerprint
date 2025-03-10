'use client'

import { useState, useRef, useEffect } from 'react'
import { CreditCard, Code, RefreshCw, AlertTriangle, Clock, User, Users } from 'lucide-react'
import PageNavigator from '@/app/components/PageNavigator'
import { readCard, IDCardInfo } from '@/app/services/idcardService'

export default function IdCardPage() {
  // 状态管理
  const [isReading, setIsReading] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<string>('');
  const [cardInfo, setCardInfo] = useState<IDCardInfo | null>(null);
  const [result, setResult] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');
  
  // 定时器引用
  const readingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // 证件类型解析为可读字符串
  const getCertTypeName = (type: number): string => {
    switch (type) {
      case 0: return '身份证';
      case 1: return '外国人居住证';
      case 2: return '港澳台居住证';
      default: return '未知';
    }
  };
  
  // 清除表单数据
  const clearForm = () => {
    setCardInfo(null);
    setPhoto('');
    setTimeElapsed('');
    setResult('');
  };
  
  // 读取身份证
  const readIDCard = async () => {
    try {
      const startTime = Date.now();
      const response = await readCard();
      const endTime = Date.now();
      
      // 计算耗时
      setTimeElapsed(`${endTime - startTime} 毫秒`);
      
      if (response.result.resultFlag !== 0) {
        setResult(`${response.result.errorMsg}\nreturn: ${response.result.resultFlag}`);
      } else {
        setCardInfo(response.info);
        setPhoto(`data:image/jpeg;base64,${response.info.Photo}`);
        setResult(response.result.errorMsg || '读卡成功');
      }
    } catch (error) {
      console.error('读卡出错:', error);
      setResult('读卡出错，请检查设备连接');
    }
  };
  
  // 切换读卡状态
  const toggleCardReading = () => {
    if (isReading) {
      // 停止读卡
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
        readingIntervalRef.current = null;
      }
      setIsReading(false);
    } else {
      // 开始读卡
      clearForm();
      startTimeRef.current = Date.now();
      setIsReading(true);
      readIDCard(); // 立即读一次
      readingIntervalRef.current = setInterval(readIDCard, 2000); // 然后每2秒读一次
    }
  };
  
  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        {/* 页面标题和查看源码按钮 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>身份证识别</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">读取和验证身份证信息</span>
          </div>
          
        </div>
        
        <div className="w-full overflow-auto" style={{display: 'table'}}>
          <div style={{display: 'table-row-group'}}>
            <div style={{display: 'table-row'}}>
              {/* 控制卡片 */}
              <div style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '25%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center">
                      <CreditCard size={18} className="mr-2 text-green-500" />
                      身份证读卡器
                    </h2>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isReading 
                        ? 'bg-blue-100 text-blue-700 animate-pulse' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isReading ? '读卡中...' : '等待操作'}
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <button
                    onClick={toggleCardReading}
                    className={`w-full ${
                      isReading 
                        ? 'bg-gray-500 hover:bg-gray-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors mb-4`}
                  >
                    {isReading ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        停止读卡
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} className="mr-2" />
                        开始读卡
                      </>
                    )}
                  </button>
                  
                  {/* 状态信息 */}
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        读卡时间
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex items-center">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        {timeElapsed || '- -'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        读卡结果
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm h-24 overflow-auto">
                        {result || '- -'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 使用指南 */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">使用指南</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 text-gray-600 font-medium text-xs">1</div>
                        <p className="text-sm text-gray-600">确保身份证阅读器已连接</p>
                      </div>
                      <div className="flex">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 text-gray-600 font-medium text-xs">2</div>
                        <p className="text-sm text-gray-600">点击 开始读卡 按钮</p>
                      </div>
                      <div className="flex">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 text-gray-600 font-medium text-xs">3</div>
                        <p className="text-sm text-gray-600">将身份证放到读卡区</p>
                      </div>
                      <div className="flex">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 text-gray-600 font-medium text-xs">4</div>
                        <p className="text-sm text-gray-600">读取完成后查看结果</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 身份证信息卡片 */}
              <div style={{display: 'table-cell', paddingRight: '1.5rem', paddingBottom: '1.5rem', width: '50%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <User size={18} className="mr-2 text-brand-red" />
                    身份证信息
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          证件类别
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                          {cardInfo ? getCertTypeName(cardInfo.certType) : '- -'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          姓名
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm font-medium">
                          {cardInfo?.name || '- -'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          性别
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                          {cardInfo?.sex || '- -'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          民族
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                          {cardInfo?.nation || '- -'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          出生日期
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                          {cardInfo?.birthday || '- -'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        住址
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                        {cardInfo?.address || '- -'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        身份证号
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-brand-red font-bold">
                        {cardInfo?.idCode || '- -'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        签发机关
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                        {cardInfo?.department || '- -'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          有效期开始
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                          {cardInfo?.startDate || '- -'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          有效期结束
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                          {cardInfo?.endDate || '- -'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 照片显示卡片 */}
              <div style={{display: 'table-cell', paddingBottom: '1.5rem', width: '25%', verticalAlign: 'top'}}>
                <div className="card p-6 h-full">
                  <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <Users size={18} className="mr-2 text-blue-500" />
                    照片显示
                  </h2>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center" style={{height: '320px'}}>
                    {photo ? (
                      <img 
                        src={photo} 
                        alt="身份证照片" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <CreditCard size={48} className="text-gray-300 mb-4" />
                        <p className="text-sm text-gray-400">暂无照片</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-700 text-sm">信息安全提示</h3>
                        <p className="text-xs text-blue-600 mt-1">身份证信息敏感，请确保在安全环境下使用，并在使用完毕后妥善处理相关数据。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 页面导航 */}
      <PageNavigator />
    </div>
  );
}