import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Order from '../views/Order.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/order', component: Order },

  // 商家后台
  {
    path: '/merchant',
    component: () => import('../views/merchant/MerchantLayout.vue'),
    children: [
      { path: '', redirect: '/merchant/dashboard' },
      { path: 'dashboard', component: () => import('../views/merchant/MerchantDashboard.vue') },
      { path: 'products', component: () => import('../views/merchant/ProductList.vue') },
      { path: 'products/edit/:id?', component: () => import('../views/merchant/ProductEdit.vue') },
      { path: 'seckill', component: () => import('../views/merchant/MerchantSeckillList.vue') },
      { path: 'seckill/edit/:id?', component: () => import('../views/merchant/MerchantSeckillEdit.vue') },
      { path: 'products/stats/:id', component: () => import('../views/merchant/ProductStats.vue') },
      { path: 'orders', component: () => import('../views/merchant/MerchantOrderList.vue') }
    ]
  },

  // 管理员独立登录页
  { path: '/admin/login', component: () => import('../views/admin/AdminLogin.vue') },

  // 管理员后台
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/merchant-audit' },
      { path: 'merchant-audit', component: () => import('../views/admin/MerchantAudit.vue') },
      // ★ 新增
      { path: 'product-audit', component: () => import('../views/admin/ProductAudit.vue') },
      { path: 'users', component: () => import('../views/admin/UserManage.vue') },
      { path: 'banners', component: () => import('../views/admin/BannerManage.vue') },
      { path: 'logs', component: () => import('../views/admin/OperationLog.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const role = sessionStorage.getItem('role')

  if (to.path.startsWith('/merchant')) {
    if (role !== 'MERCHANT') {
      alert('请先用商家账号登录')
      return '/home'
    }
  }

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (role !== 'ADMIN') {
      alert('需要管理员权限')
      return '/admin/login'
    }
  }

  if (to.path === '/order') {
    if (role === 'MERCHANT') {
      alert('商家不能查看用户订单')
      return '/merchant/dashboard'
    }
    if (role === 'ADMIN') {
      alert('管理员不能查看用户订单')
      return '/admin/merchant-audit'
    }
  }
})

export default router