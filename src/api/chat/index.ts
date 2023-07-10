import request from '../../utils/request';
import { AxiosPromise } from 'axios';
import { ChatData, ChatResult } from './types';

/**
 * chat请求
 *
 * @param data {ChatData}
 * @returns
 */
export function chatApi(data: ChatData, uid: string): AxiosPromise<ChatResult> {
    return request({
        url: '/chat',
        method: 'post',
        // params: data
        data: JSON.stringify(data),
        headers: {
            'uid': uid
        }
    });
}

/**
 * 关闭sse连通
 * 
 * @param uid uid编码
 * @returns 
 */
export function closeChatApi(uid: string) {
    return request({
        url: '/closeSse',
        method: 'get',
        headers: {
            'uid': uid
        }
    });
}