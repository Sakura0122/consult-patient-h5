import type { FieldRule } from 'vant'
// 手机号校验规则
const mobileRules: FieldRule[] = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
]
// 密码校验规则
const passwordRules: FieldRule[] = [
  { required: true, message: '请输入密码' },
  { pattern: /^\w{8,24}$/, message: '密码需8-24个字符' }
]
// 短信校验规则
const codeRules: FieldRule[] = [
  { required: true, message: '请输入验证码' },
  { pattern: /^\d{6}$/, message: '验证码是6位数字' }
]

export { mobileRules, passwordRules, codeRules }