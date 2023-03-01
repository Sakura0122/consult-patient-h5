import axios from 'axios'
import type { Method } from 'axios'
import { useUserStore } from '@/stores'
import { showToast } from 'vant'
import router from '@/router'

// 1. 新axios实例，基础配置
const baseURL = 'https://consult-api.itheima.net/'
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 2. 请求拦截器，携带token
instance.interceptors.request.use(
  (config) => {
    const store = useUserStore()
    if (store.user?.token && config.headers) {
      config.headers.Authorization = `Bearer ${store.user.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 3. 响应拦截器，剥离无效数据，401拦截
instance.interceptors.response.use(
  (res) => {
    // status 是200响应成功 res.data.code 是10000业务成功
    // 如果不是 10000 使用 vant 的轻提示 报错阻断程序
    if (res.data.code !== 10000) {
      showToast(res.data.message || '网络异常')
      return Promise.reject(res.data)
    }
    // 剥离无效数据
    return res.data
  },
  (error) => {
    // 请求报错 响应出错
    // 遇见401跳转登录
    // 1.现在在 /user/patient 页面下发起一个获取用户信息的请求 但此时token失效
    // 2.跳转登陆页面 登陆成功之后 跳转回 /user/patient页面 （默认跳转 /user 首页）
    if (error.response.status === 401) {
      // 删除用户信息
      const userStore = useUserStore()
      userStore.delUser()
      router.push(`/login/returnUrl=${router.currentRoute.value.fullPath}`)
    }
    return Promise.reject(error)
  }
)

// 4. 请求工具函数
type Data<T> = {
  code: string
  message: string
  data: T
}
const request = <T>(
  url: string,
  method: Method = 'get',
  submitData?: object
) => {
  return instance.request<T, Data<T>>({
    url,
    method,
    // get 提交数据 选项：params
    // post 提交数据 选项：data
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData
  })
}
export { baseURL, instance, request }
