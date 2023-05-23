/**
 * 聊天请求参数
 */
export interface ChatData {
    /**
     * 发送的问题消息
     */
    msg?: string;

}

/**
 * 登录响应
 */
export interface ChatResult {
    /**
     * 访问token
     */
    question_tokens?: string;
}