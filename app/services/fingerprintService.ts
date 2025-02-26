// 指纹设备 API URL
const FPDEVICE_URL = 'http://127.0.0.1:8867/'

// 指纹数据接口
export interface FingerprintData {
  result: string       // 结果代码
  quality: string      // 图像质量
  image: string        // 指纹图像 Base64
  characteristic: string // 指纹特征 Base64
}

/**
 * 获取指纹数据
 * @param quality 质量阈值
 * @param signal AbortController 信号用于取消请求
 * @returns 指纹数据
 */
export async function getFingerprint(
  quality: string = '40',
  signal?: AbortSignal
): Promise<FingerprintData> {
  try {
    // 构建请求参数
    const params = `?send{getimgae,1,${quality},0}`
    const url = FPDEVICE_URL + params
    
    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      signal,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // 获取文本响应
    const text = await response.text()
    
    // 解析响应
    return parseResponse(text)
  } catch (error) {
    console.error('获取指纹数据失败:', error)
    // 返回错误结果
    return {
      result: '-103', // 设备通讯异常
      quality: '0',
      image: '',
      characteristic: ''
    }
  }
}

/**
 * 解析指纹设备返回的响应
 * @param response 设备响应文本
 * @returns 解析后的指纹数据
 */
function parseResponse(response: string): FingerprintData {
  // 默认返回值
  const defaultData: FingerprintData = {
    result: '-99', // 未知异常
    quality: '0',
    image: '',
    characteristic: ''
  }
  
  // 按 | 分割响应
  const parts = response.split('|')
  
  // 检查是否为有效响应
  if (parts.length < 3) {
    return defaultData
  }
  
  // 返回解析后的数据
  return {
    result: parts[0],
    quality: parts[1],
    image: parts[2] !== '0' ? parts[2] : '',
    characteristic: parts.length > 3 ? parts[3] : ''
  }
}