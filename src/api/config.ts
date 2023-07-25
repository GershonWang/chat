import request from '../utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取openKey的api
 */
export function getAPIKeyApi(data: OpenKeyData): AxiosPromise<any> {
    return request({
        url: '/config/getAPIKey',
        method: 'post',
        params: data,
    });
}

/**
 * 设置openKey的api
 */
export function setAPIKeyApi(data: OpenKeyData): AxiosPromise<any> {
    return request({
        url: '/config/setAPIKey',
        method: 'post',
        params: data,
    });
}

/**
 * 请求参数
 */
export interface OpenKeyData {
    /**
     * 用户名
     */
    username?: string;
    /**
     * openai的apiKey
     */
    apikey?: string;

}