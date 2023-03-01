import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('@/views/Login/index.vue') },
    {
      path: '/',
      component: () => import('@/views/Layout/index.vue'),
      redirect: '/home',
      children: [
        {
          path: '/home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/article',
          component: () => import('@/views/Article/index.vue'),
          meta: { title: '健康百科' }
        },
        {
          path: '/notify',
          component: () => import('@/views/Notify/index.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: '/user',
          component: () => import('@/views/User/index.vue'),
          meta: { title: '个人中心' }
        }
      ]
    }
  ]
})

// 访问权限控制
router.beforeEach((to) => {
  // 处理标题
  document.title = `在线问诊-${to.meta.title || ''}`
  const userStore = useUserStore()
  // 不需要登录的页面，白名单
  const whiteList = ['/login']
  // 需求：当你没有登录也就是没有token 且 你访问的不是登录页面  拦截到登录
  if (!userStore.user?.token && !whiteList.includes(to.path)) return '/login'
})

export default router
