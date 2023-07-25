import request from '../utils/request';
import { AxiosPromise } from 'axios';

/**
 * 登录API
 * @param data {LoginData}用户信息
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<any> {
  return request({
    url: '/auth/login',
    method: 'post',
    params: data,
  });
}

/**
 * 注册用户API
 * @param data {LoginData}用户信息
 * @returns 
 */
export function registApi(data: LoginData): AxiosPromise<any> {
  return request({
    url: '/user/addUser',
    method: 'post',
    params: data,
  });
}

/**
 * 请求参数
 */
export interface LoginData {
  /**
   * 用户名
   */
  username?: string;
  /**
   * 密码
   */
  password?: string;

}