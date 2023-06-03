import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus'

const baseURL = 'http://www.dongpl.com:8000';

// 创建 axios 实例
const service = axios.create({
  baseURL: baseURL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  console.log('请求拦截器中', config);
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

// 响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
  console.log('响应拦截器中', response);
  const status = response.status;
  if (status == 200) {
    // 响应数据为二进制流处理(Excel导出)
    if (response.data instanceof ArrayBuffer) {
      return response;
    }
    return response;
  } else {
    const { msg } = response.data;
    ElMessage.error(msg || '系统出错');
    return Promise.reject(new Error(msg || 'Error'));
  }
}, (error: any) => {
  console.log('error.code',);
  if(error.code =='ERR_NETWORK'){
    ElMessage.error('网络异常！');
  } else{
    ElMessage.error('服务异常请重试并联系开发者！！');
  }
  return Promise.reject(error.message);
});

// 导出 axios 实例
export default service;
