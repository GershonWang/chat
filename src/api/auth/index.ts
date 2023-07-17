import request from '../../utils/request';
import { AxiosPromise } from 'axios';
import { LoginData, LoginResult } from './types';

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<LoginResult> {
  return request({
    url: '/auth/login',
    method: 'post',
    params: data,
  });
}

/**
 * 注册用户API
 * @param data 用户信息
 * @returns 
 */
export function registApi(data: LoginData): AxiosPromise<LoginResult> {
  return request({
    url: '/auth/addUser',
    method: 'post',
    params: data,
  });
}