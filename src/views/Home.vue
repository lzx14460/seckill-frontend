<template>
  <div class="home-page">
    <!-- 顶部导航（黑色） -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">闪购</span>
        </div>

        <nav class="nav-menu">
          <a class="nav-item active">秒杀首页</a>
          <a class="nav-item" @click="goOrder">我的订单</a>
        </nav>

        <div class="nav-right">
          <template v-if="userStore.isLogin()">
            <span class="user-name">{{ userStore.username }}</span>
            <a class="logout" @click="handleLogout">退出</a>
          </template>
          <template v-else>
            <button class="login-btn" @click="showLogin = true">登录 / 注册</button>
          </template>
        </div>
      </div>
    </header>

    <!-- Hero 横幅（黑色） -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-tag">FLASH SALE</div>
          <h1>限时秒杀</h1>
          <p>每日 10:00 准时开抢 · 数量有限 · 先到先得</p>

          <div class="countdown">
            <span class="cd-label">距结束</span>
            <div class="cd-time">
              <span class="cd-unit">{{ countdown.h }}</span>
              <span class="cd-colon">:</span>
              <span class="cd-unit">{{ countdown.m }}</span>
              <span class="cd-colon">:</span>
              <span class="cd-unit">{{ countdown.s }}</span>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-num">1000+</div>
              <div class="stat-label">今日已抢</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">100</div>
              <div class="stat-label">剩余库存</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">99%</div>
              <div class="stat-label">抢购成功率</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">24h</div>
              <div class="stat-label">全天候服务</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品区（白色） -->
    <section class="goods-section">
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab"
          :class="['tab', activeTab === tab ? 'active' : '']"
          @click="activeTab = tab"
        >
          {{ tab }}
        </div>
      </div>

      <div class="goods-grid">
        <div v-for="goods in goodsList" :key="goods.id" class="goods-card">
          <div class="goods-image">
            <img :src="goods.image || defaultImage" :alt="goods.name" />
            <div class="goods-badge">秒杀</div>
          </div>
          <div class="goods-info">
            <h3 class="goods-title">{{ goods.name || '限时秒杀商品' }}</h3>
            <div class="price-row">
              <span class="price-now">¥{{ goods.seckillPrice || 4999 }}</span>
              <span class="price-old">¥{{ goods.originalPrice || 8999 }}</span>
            </div>
            <div class="stock-row">
              <div class="stock-bar">
                <div class="stock-fill" :style="{ width: getStockPercent(goods) + '%' }"></div>
              </div>
              <span class="stock-text">仅剩 {{ goods.stock }} 件</span>
            </div>
            <button
              class="buy-btn"
              :disabled="goods.stock <= 0"
              @click="handleSeckill(goods)"
            >
              {{ goods.stock <= 0 ? '已抢光' : '立即抢购' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <LoginDialog v-model="showLogin" @success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '../utils/toast'
import request from '../api'
import LoginDialog from '../components/LoginDialog.vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const showLogin = ref(false)
const activeTab = ref('全部')
const tabs = ['全部', '数码', '家电', '服饰', '美妆', '食品', '其他']

const defaultImage = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop'

const goodsList = ref([
  { id: 1, name: '限时秒杀商品 A', seckillPrice: 4999, originalPrice: 8999, stock: 100 }
])

const countdown = reactive({ h: '00', m: '00', s: '00' })

const loadGoods = async () => {
  try {
    const res = await request.get('/seckill/goods/list')
    if (res.code === 200 && res.data && res.data.length) {
      goodsList.value = res.data.map(g => ({
        ...g,
        name: g.name || '限时秒杀商品',
        originalPrice: g.originalPrice || Math.round(g.seckillPrice * 1.8)
      }))
    }
  } catch (e) {
    console.log('使用默认数据')
  }
}

const handleSeckill = async (goods) => {
  if (!userStore.isLogin()) {
    showLogin.value = true
    return
  }
  try {
    const res = await request.post(`/seckill/${goods.id}`)
    if (res.code === 200) {
      toast.success('秒杀成功，订单处理中')
      goods.stock--
    } else {
      toast.error(res.message)
    }
  } catch (e) {
    toast.error('请勿重复秒杀', '每个用户限购一件')
  }
}

const onLoginSuccess = () => ElMessage.success('欢迎回来')

const goOrder = () => {
  if (!userStore.isLogin()) {
    showLogin.value = true
    return
  }
  router.push('/order')
}

const handleLogout = async () => {
  await request.get('/user/logout')
  userStore.clearUser()
  ElMessage.success('已退出登录')
}

const getStockPercent = (goods) => {
  return Math.min(100, (goods.stock / 100) * 100)
}

const startCountdown = () => {
  const endTime = new Date().setHours(24, 0, 0, 0)
  setInterval(() => {
    const diff = endTime - Date.now()
    if (diff <= 0) return
    countdown.h = String(Math.floor(diff / 3600000)).padStart(2, '0')
    countdown.m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    countdown.s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  }, 1000)
}

onMounted(() => {
  loadGoods()
  startCountdown()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f7f7f7;
  color: #222;
}

/* ========== 顶部导航 ========== */
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
}

.logo-icon {
  font-size: 22px;
}

.logo-text {
  color: #fff;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-item {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-item:hover,
.nav-item.active {
  color: #fff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 14px;
  color: #fff;
}

.logout {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.logout:hover {
  color: #fff;
}

.login-btn {
  padding: 8px 20px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.85;
}

/* ========== Hero 区 ========== */
.hero {
  background: #000;
  color: #fff;
  padding: 80px 40px;
}

.hero-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-tag {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 3px;
  color: #999;
  margin-bottom: 24px;
}

.hero-left h1 {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 20px;
}

.hero-left p {
  font-size: 16px;
  color: #888;
  margin-bottom: 48px;
  letter-spacing: 2px;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cd-label {
  font-size: 14px;
  color: #888;
}

.cd-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cd-unit {
  display: inline-block;
  min-width: 52px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.cd-colon {
  font-size: 24px;
  color: #666;
}

.hero-right {
  display: flex;
  justify-content: flex-end;
}

.hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 420px;
}

.stat-item {
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

/* ========== 商品区 ========== */
.goods-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 40px 80px;
}

.tabs {
  display: flex;
  gap: 36px;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 40px;
}

.tab {
  font-size: 15px;
  color: #999;
  cursor: pointer;
  padding-bottom: 16px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #000;
  font-weight: 600;
  border-bottom-color: #000;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 40px 24px;
}

.goods-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.goods-card:hover {
  transform: translateY(-4px);
}

.goods-image {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.goods-card:hover .goods-image img {
  transform: scale(1.06);
}

.goods-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: #000;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  letter-spacing: 1px;
}

.goods-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.price-now {
  font-size: 22px;
  font-weight: 700;
  color: #000;
}

.price-old {
  font-size: 13px;
  color: #bbb;
  text-decoration: line-through;
}

.stock-row {
  margin-bottom: 16px;
}

.stock-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.stock-fill {
  height: 100%;
  background: #000;
  transition: width 0.3s;
}

.stock-text {
  font-size: 12px;
  color: #999;
}

.buy-btn {
  width: 100%;
  height: 42px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s;
}

.buy-btn:hover:not(:disabled) {
  background: #333;
}

.buy-btn:disabled {
  background: #ddd;
  color: #999;
  cursor: not-allowed;
}
</style>