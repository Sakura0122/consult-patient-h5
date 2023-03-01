import { request } from '@/utils/request'
import type { User, CodeType, UserInfo, Patient } from '@/types/user'

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

// 获取个人信息
export const getUserInfo = () => {
  return request<UserInfo>('/patient/myUser')
}

// 获取患者信息
export const getPatientList = () => {
  return request<Patient[]>('patient/myList')
}

// 添加患者业务
export const addPatient = (patient: Patient) => {
  return request('/patient/add', 'post', patient)
}

// 编辑患者信息
export const editPatient = (patient: Patient) => {
  return request('/patient/update', 'put', patient)
}

// 删除患者信息
export const delPatient = (id: string) => {
  return request(`/patient/del/${id}`, 'delete')
}
