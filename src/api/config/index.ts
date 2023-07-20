import request from '../../utils/request';
import { AxiosPromise } from 'axios';
import { OpenKeyData, OpenKeyResult } from './types';

/**
 * 获取openKey的api
 * @param data {LoginData}
 * @returns
 */
export function getAPIKeyApi(data: OpenKeyData): AxiosPromise<OpenKeyResult> {
    return request({
        url: '/config/getAPIKey',
        method: 'post',
        params: data,
    });
}

/**
 * 设置openKey的api
 * @param data {LoginData}
 * @returns
 */
export function setAPIKeyApi(data: OpenKeyData): AxiosPromise<OpenKeyResult> {
    return request({
        url: '/config/setAPIKey',
        method: 'post',
        params: data,
    });
}