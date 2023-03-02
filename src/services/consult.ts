import type {
  DoctorPage,
  PageParams,
  FollowType,
  KnowledgeParams,
  KnowledgePage
} from '@/types/consult'
import { request } from '@/utils/request'

// 获取文章信息
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('/patient/home/knowledge', 'get', params)

// 获取关注医生列表
export const getDoctorPage = (params: PageParams) => {
  return request<DoctorPage>('/home/page/doc', 'get', params)
}

// 关注医生
export const followOrUnfollow = (id: string, type: FollowType = 'doc') =>
  request('/like', 'POST', { id, type })
