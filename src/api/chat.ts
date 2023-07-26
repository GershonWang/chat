import request from '../utils/request';
import { AxiosPromise } from 'axios';

/**
 * chat请求
 *
 * @param data {ChatData}
 * @returns
 */
export function chatApi(data: ChatData, uid: string | null): AxiosPromise<any> {
    return request({
        url: '/chat',
        method: 'post',
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

/**
 * 聊天请求参数
 */
export interface ChatData {
    /**
     * 发送的问题消息
     */
    msg?: string;

}