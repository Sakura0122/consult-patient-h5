import { request } from '@/utils/request'
import type { User, CodeType } from '@/types/user'

// 密码登录
export const loginByPassword = (mobile: string, password: string) => {
  return request<User>('/login/password', 'post', { mobile, password })
}

// 获取短信验证码
export const sendMobileCode = (mobile: string, type: CodeType) => {
  return request('/code', 'get', { mobile, type })
}

// 短信验证码登录
export const loginByMobile = (mobile: string, code: string) => {
  return request<User>('/login', 'POST', { mobile, code })
}
