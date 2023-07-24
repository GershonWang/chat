/**
 * 登录请求参数
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

/**
 * 登录响应
 */
export interface LoginResult {
  /**
   * 返回的数据对象
   */
  data: any;
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

}