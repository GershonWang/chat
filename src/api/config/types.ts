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

/**
 * 响应对象
 */
export interface OpenKeyResult {
    /**
     * 状态码
     */
    code?: string;
    /**
     * 信息
     */
    msg?: string;
    /**
     * 用户名
     */
    name?: string;
    /**
     * 返回的数据对象
     */
    data: any;

}