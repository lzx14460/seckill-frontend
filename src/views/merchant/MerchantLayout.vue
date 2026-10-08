<template>
  <div class="merchant-layout">
    <!-- 顶部黑色导航（和首页一致） -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="logo" @click="$router.push('/home')">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">闪购 · 商家后台</span>
        </div>

        <nav class="nav-menu">
          <a
            :class="['nav-item', $route.path === '/merchant/dashboard' ? 'active' : '']"
            @click="$router.push('/merchant/dashboard')"
          >
            数据看板
          </a>
          <a
            :class="['nav-item', $route.path.startsWith('/merchant/products') ? 'active' : '']"
            @click="$router.push('/merchant/products')"
          >
            商品管理
          </a>
          <a
            :class="['nav-item', $route.path.startsWith('/merchant/orders') ? 'active' : '']"
            @click="$router.push('/merchant/orders')"
          >
            订单管理
          </a>
        </nav>
          <a
            :class="['nav-item', $route.path.startsWith('/merchant/seckill') ? 'active' : '']"
            @click="$router.push('/merchant/seckill')"
            >
            秒杀活动
          </a>

        <div class="nav-right">
          <span class="shop-name">{{ userName }}</span>
          <a class="back-home" @click="$router.push('/home')">返回首页</a>
          <a class="logout" @click="logout">退出</a>
        </div>
      </div>
    </header>

    <!-- 内容区 -->
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userName = computed(() => sessionStorage.getItem('userName') || '商家')

async function logout() {
  await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
  try {
    await fetch('http://localhost:8080/user/logout', { method: 'POST', credentials: 'include' })
  } catch (e) {}
  sessionStorage.clear()
  ElMessage.success('已退出')
  router.push('/home')
}
</script>

<style scoped>
.merchant-layout {
  min-height: 100vh;
  background: #f7f7f7;
  color: #222;
}
/* ============ 顶部导航（照搬首页） ============ */
.navbar {
  background: #000;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex; align-items: center; gap: 8px;
  font-size: 18px; font-weight: 800; letter-spacing: 1px;
  cursor: pointer;
}

.logo-icon { font-size: 22px; }
.logo-text { color: #fff; }

.nav-menu { display: flex; gap: 32px; }

.nav-item {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-item:hover, .nav-item.active { color: #fff; }

.nav-right { display: flex; align-items: center; gap: 16px; }

.shop-name {
  font-size: 14px;
  color: #fff;
  padding: 4px 12px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 4px;
}

.back-home, .logout {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.back-home:hover { color: #00d4ff; }
.logout:hover { color: #fff; }

/* ============ 内容区 ============ */
.main {
  background: #f7f7f7;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 40px 60px;
}

@media (max-width: 768px) {
  .nav-inner { padding: 0 20px; }
  .nav-menu { display: none; }
  .main { padding: 20px 16px 40px; }
}
</style>