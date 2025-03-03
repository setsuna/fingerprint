// 身份证信息接口
export interface IDCardInfo {
    certType: number;
    name: string;
    sex: string;
    nation: string;
    birthday: string;
    address: string;
    idCode: string;
    department: string;
    startDate: string;
    endDate: string;
    Photo: string;
  }
  
  // 结果接口
  export interface IDCardResult {
    resultFlag: number;
    errorMsg: string;
  }
  
  // 响应接口
  export interface IDCardResponse {
    info: IDCardInfo;
    result: IDCardResult;
  }
  
  /**
   * 读取身份证信息
   * @returns 返回身份证数据的Promise
   */
  export async function readCard(): Promise<IDCardResponse> {
    try {
      const response = await fetch('http://127.0.0.1:8000/cgi-bin/readCard', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('读取身份证失败:', error);
      // 返回默认错误响应
      return {
        info: {
          certType: 0,
          name: '',
          sex: '',
          nation: '',
          birthday: '',
          address: '',
          idCode: '',
          department: '',
          startDate: '',
          endDate: '',
          Photo: ''
        },
        result: {
          resultFlag: -1,
          errorMsg: error instanceof Error ? error.message : '未知错误'
        }
      };
    }
  }