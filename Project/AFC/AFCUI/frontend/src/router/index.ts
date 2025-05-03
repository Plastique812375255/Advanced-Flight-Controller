// 从vue-router导入所需功能
// @ts-ignore
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: { name: 'Unpaired' }
  },
  {
    path: '/unpaired',
    name: 'Unpaired',
    component: () => import('@/views/UnpairedView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/pairing',
    name: 'Pairing',
    component: () => import('@/views/PairingView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/desktop',
    name: 'Desktop',
    component: () => import('@/views/DesktopView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/setup-model',
    name: 'SetupModel',
    component: () => import('@/views/SetupModelView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'params/:modelId',
        name: 'ModelParams',
        component: () => import('@/views/ParamsView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局导航守卫，处理身份验证和连接状态
// @ts-ignore
router.beforeEach((to, from, next) => {
  // 检查是否需要认证（连接状态）
  // @ts-ignore
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth === true)
  
  // 从AFTX获取连接状态
  const isConnected = window.Android?.getConnectionStatus() === 'connected'
  
  if (requiresAuth && !isConnected) {
    // 如果需要连接但未连接，重定向到未配对页面
    next({ name: 'Unpaired' })
  } else {
    next()
  }
})

export default router 