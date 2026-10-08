<template>
  <div class="admin-layout">
    <header class="navbar">
      <div class="nav-inner">
        <div class="logo" @click="$router.push('/admin/merchant-audit')">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">闪购 · 管理后台</span>
        </div>

        <nav class="nav-menu">
          <a
            :class="['nav-item', $route.path.startsWith('/admin/merchant-audit') ? 'active' : '']"
            @click="$router.push('/admin/merchant-audit')"
          >
            商家审核
          </a>
          <a
            :class="['nav-item', $route.path.startsWith('/admin/product-audit') ? 'active' : '']"
            @click="$router.push('/admin/product-audit')"
          >
            商品审核
          </a>
          <a
            :class="['nav-item', $route.path.startsWith('/admin/users') ? 'active' : '']"
            @click="$router.push('/admin/users')"
          >
            用户管理
          </a>
          <a
        :class="['nav-item', $route.path.startsWith('/admin/banners') ? 'active' : '']"
        @click="$router.push('/admin/banners')"
        >
        轮播图管理
        </a>
        <a
        :class="['nav-item', $route.path.startsWith('/admin/logs') ? 'active' : '']"
        @click="$router.push('/admin/logs')"
        >
        操作日志
        </a>
        </nav>

        <div class="nav-right">
          <span class="user-name">{{ userName }}</span>
          <a class="back" @click="$router.push('/home')">返回首页</a>
          <a class="logout" @click="logout">退出</a>
        </div>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../api'

const router = useRouter()
const userName = computed(() => sessionStorage.getItem('userName') || '管理员')

async function logout() {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确认退出',
      cancelButtonText: '取消',
    })
  } catch (e) { return }

  try {
    // ★ 用相对路径，走 Vite proxy
    await fetch('/user/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (e) {
    // 忽略
  }

  sessionStorage.clear()
  ElMessage.success('已退出')
  router.push('/admin/login')
}
</script>
<style scoped>
.admin-layout { min-height: 100vh; background: #f7f7f7; }
.navbar { background: #000; color: #fff; position: sticky; top: 0; z-index: 100; }
.nav-inner {
  max-width: 1400px; margin: 0 auto; padding: 0 40px; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.logo { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 800; cursor: pointer; }
.logo-icon { font-size: 22px; }
.nav-menu { display: flex; gap: 32px; }
.nav-item { font-size: 14px; color: #999; cursor: pointer; transition: color 0.2s; }
.nav-item:hover, .nav-item.active { color: #fff; }
.nav-right { display: flex; align-items: center; gap: 16px; }
.user-name {
  font-size: 14px; color: #fff; padding: 4px 12px;
  background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.25); border-radius: 4px;
}
.back, .logout { font-size: 14px; color: #666; cursor: pointer; }
.back:hover { color: #00d4ff; }
.logout:hover { color: #fff; }
.main { max-width: 1400px; margin: 0 auto; padding: 32px 40px 60px; }
</style>