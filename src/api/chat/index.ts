import request from '../../utils/request';
import { AxiosPromise } from 'axios';
import { ChatData, ChatResult } from './types';

/**
 * chat请求
 *
 * @param data {ChatData}
 * @returns
 */
export function chatApi(data: ChatData): AxiosPromise<ChatResult> {
    return request({
        url: '/chat',
        method: 'post',
        params: data
    });
}