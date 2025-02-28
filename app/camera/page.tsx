'use client'

import { useEffect, useState, useRef } from 'react'
import { Camera, Code, RefreshCw, Rotate3D, Save, ImagePlus, CreditCard, Layers } from 'lucide-react'
import PageNavigator from '@/app/components/PageNavigator'
import * as cameraService from '@/app/services/cameraService'

export default function CameraPage() {
  // 状态管理
  const [devices, setDevices] = useState<cameraService.Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number>(0);
  const [resolutions, setResolutions] = useState<cameraService.Resolution[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<number>(0);
  const [isVideoStarted, setIsVideoStarted] = useState<boolean>(false);
  const [videoFrame, setVideoFrame] = useState<string>('');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [savePath, setSavePath] = useState<string>('/tmp');
  const [isCorrectingPerspective, setIsCorrectingPerspective] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeviceFound, setIsDeviceFound] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef<number>(0);

  // 设备查找
  const findDevices = async () => {
    setIsLoading(true);
    try {
      const deviceData = await cameraService.getAllDisplayInfo();
      setDevices(deviceData);
      
      if (deviceData.length > 0) {
        setSelectedDevice(0);
        setResolutions(deviceData[0].resolution || []);
        setIsDeviceFound(true);
      }
    } catch (error) {
      console.error('查找设备出错:', error);
      alert('连接设备服务失败，请确保设备已连接且服务已启动');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理设备选择变更
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceIndex = parseInt(e.target.value);
    setSelectedDevice(deviceIndex);
    
    if (devices[deviceIndex]) {
      setResolutions(devices[deviceIndex].resolution || []);
      setSelectedResolution(0);
    }
  };

  // 处理分辨率选择变更
  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResolution(parseInt(e.target.value));
  };

  // 开始视频预览
  const startVideo = async () => {
    if (isVideoStarted) return;
    
    try {
      await cameraService.startPreview(selectedDevice, selectedResolution);
      setIsVideoStarted(true);
      
      // 启动定时器获取帧
      frameCountRef.current = 0;
      timerRef.current = setInterval(() => {
        getFrame();
        frameCountRef.current += 1;
      }, 300);
    } catch (error) {
      console.error('启动视频失败:', error);
      alert('启动视频失败，请检查设备连接');
    }
  };

  // 停止视频预览
  const stopVideo = async () => {
    if (!isVideoStarted) return;
    
    try {
      await cameraService.stopPreview(selectedDevice);
      setIsVideoStarted(false);
      
      // 清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      frameCountRef.current = 0;
    } catch (error) {
      console.error('停止视频失败:', error);
    }
  };

  // 获取视频帧
  const getFrame = async () => {
    try {
      const frameData = await cameraService.getFrame();
      setVideoFrame(frameData);
    } catch (error) {
      console.error('获取视频帧出错:', error);
      
      // 出错时停止视频
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsVideoStarted(false);
      }
    }
  };

  // 拍照
  const capturePicture = async () => {
    try {
      const imageData = await cameraService.getPic(savePath);
      
      // 限制最多显示4张图片
      setCapturedImages(prev => {
        const newImages = [...prev, imageData];
        return newImages.slice(-4);
      });
    } catch (error) {
      console.error('拍照失败:', error);
      alert('拍照失败，请检查设备连接');
    }
  };

  // 启用/禁用纠偏
  const togglePerspectiveCorrection = async () => {
    const newValue = !isCorrectingPerspective;
    
    try {
      await cameraService.enableDeskImage(newValue);
      setIsCorrectingPerspective(newValue);
    } catch (error) {
      console.error('设置纠偏失败:', error);
      alert('设置纠偏失败，请检查设备连接');
    }
  };

  // 旋转图像
  const rotateImage = async () => {
    try {
      // 先获取当前旋转角度
      const currentRotate = await cameraService.getRotate();
      
      // 计算新的旋转角度
      const newRotate = (currentRotate + 1) % 4;
      
      // 设置新的旋转角度
      await cameraService.rotate(newRotate);
    } catch (error) {
      console.error('旋转图像失败:', error);
      alert('旋转图像失败，请检查设备连接');
    }
  };

  // 合并身份证正反面
  const composeIDCardPic = async () => {
    try {
      // 提示用户放置正面
      if (confirm('请放置身份证，且正面朝上！放置完成后点击确定。')) {
        await cameraService.composeIDcardPic(1);
        
        // 提示用户放置反面
        if (confirm('请放置身份证，反面面朝上！放置完成后点击确定。')) {
          const imageData = await cameraService.composeIDcardPic(2);
          
          if (imageData) {
            // 添加合并后的图片
            setCapturedImages(prev => {
              const newImages = [...prev, imageData];
              return newImages.slice(-4);
            });
          }
        }
      }
    } catch (error) {
      console.error('身份证扫描失败:', error);
      alert('身份证扫描失败，请检查设备连接');
    }
  };

  // 清空截图
  const clearCapturedImages = () => {
    setCapturedImages([]);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // 如果视频已经启动，则停止
      if (isVideoStarted) {
        cameraService.stopPreview(selectedDevice).catch(console.error);
      }
    };
  }, [isVideoStarted, selectedDevice]);

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
            className="flex items-center text-sm bg-[#2EA44F] hover:bg-[#2C974B] text-white px-3 py-1.5 rounded-full transition-colors"
            onClick={() => {
              alert('查看源代码功能');
            }}
          >
            <Code size={14} className="mr-1" />
            查看源码
          </button>
        </div>
        
        {/* 主要内容区 - 使用table布局以支持Chrome 102 - 改为一行 */}
        <div className="w-full overflow-auto" style={{display: 'table', width: '100%', marginBottom: '1.5rem'}}>
          <div style={{display: 'table-row'}}>
            {/* 视频预览区域 */}
            <div style={{display: 'table-cell', paddingRight: '1.5rem', width: '40%', verticalAlign: 'top'}}>
              <div className="card p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Camera size={18} className="mr-2 text-purple-500" />
                    视频预览
                  </h2>
                  {isVideoStarted && (
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      实时预览中
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{height: '400px'}}>
                  {videoFrame ? (
                    <img 
                      src={`data:image/jpg;base64,${videoFrame}`} 
                      alt="视频预览" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Camera size={64} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">
                        {isLoading ? '正在加载...' : !isDeviceFound ? '未检测到设备' : !isVideoStarted ? '点击"打开视频"开始预览' : '正在连接...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 设备控制区域 */}
            <div style={{display: 'table-cell', paddingRight: '1.5rem', width: '20%', verticalAlign: 'top'}}>
              <div className="card p-4 h-full">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Layers size={18} className="mr-2 text-blue-500" />
                  设备控制
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1">设备选择</label>
                  <div className="flex items-center">
                    <select 
                      className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm"
                      value={selectedDevice}
                      onChange={handleDeviceChange}
                      disabled={isVideoStarted || !isDeviceFound}
                    >
                      {devices.map((device, index) => (
                        <option key={device.dev_idx} value={index}>{device.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1">分辨率选择</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm"
                    value={selectedResolution}
                    onChange={handleResolutionChange}
                    disabled={isVideoStarted || !isDeviceFound}
                  >
                    {resolutions.map((resolution, index) => (
                      <option key={index} value={index}>{resolution.width} x {resolution.height}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  className="mb-2 w-full py-2 px-4 rounded-lg flex items-center justify-center text-white bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={findDevices}
                  disabled={isVideoStarted || isLoading}
                >
                  <RefreshCw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  查找设备
                </button>
                
                <button 
                  className={`mb-2 w-full py-2 px-4 rounded-lg flex items-center justify-center text-white ${
                    !isDeviceFound 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : isVideoStarted 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                  onClick={startVideo}
                  disabled={!isDeviceFound || isVideoStarted}
                >
                  <Camera size={16} className="mr-1" />
                  打开视频
                </button>
                
                <button 
                  className={`w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                    !isVideoStarted 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700 text-white hover:bg-gray-800'
                  }`}
                  onClick={stopVideo}
                  disabled={!isVideoStarted}
                >
                  <Camera size={16} className="mr-1" />
                  关闭视频
                </button>
              </div>
            </div>
            
            {/* 拍照控制区域 */}
            <div style={{display: 'table-cell', paddingRight: '1.5rem', width: '20%', verticalAlign: 'top'}}>
              <div className="card p-4 h-full">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <ImagePlus size={18} className="mr-2 text-brand-red" />
                  拍照控制
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1">保存路径</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm"
                    value={savePath}
                    onChange={(e) => setSavePath(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="perspective-correction" 
                      className="mr-1"
                      checked={isCorrectingPerspective}
                      onChange={togglePerspectiveCorrection}
                      disabled={!isVideoStarted}
                    />
                    <label htmlFor="perspective-correction" className="text-sm">图像纠偏</label>
                  </div>
                </div>
                
                <button 
                  className={`mb-2 w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                    !isVideoStarted 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-brand-red text-white hover:bg-red-600'
                  }`}
                  onClick={capturePicture}
                  disabled={!isVideoStarted}
                >
                  <ImagePlus size={16} className="mr-1" />
                  拍照
                </button>
                
                <button 
                  className={`mb-2 w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                    !isVideoStarted 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  onClick={rotateImage}
                  disabled={!isVideoStarted}
                >
                  <Rotate3D size={16} className="mr-1" />
                  旋转
                </button>
                
                <button 
                  className={`w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                    !isVideoStarted 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  onClick={composeIDCardPic}
                  disabled={!isVideoStarted}
                >
                  <CreditCard size={16} className="mr-1" />
                  身份证合并
                </button>
              </div>
            </div>
            
            {/* 截图预览区域 */}
            <div style={{display: 'table-cell', width: '20%', verticalAlign: 'top'}}>
              <div className="card p-4 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Save size={18} className="mr-2 text-green-600" />
                    截图预览
                  </h2>
                  
                  {capturedImages.length > 0 && (
                    <button 
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors flex items-center"
                      onClick={clearCapturedImages}
                    >
                      清空
                    </button>
                  )}
                </div>
                
                {capturedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {capturedImages.map((img, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-1 flex items-center justify-center aspect-square">
                        <img 
                          src={`data:image/jpg;base64,${img}`} 
                          alt={`截图 ${index + 1}`} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Save size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">暂无截图</p>
                  </div>
                )}
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