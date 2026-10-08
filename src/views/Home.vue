<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">闪购</span>
        </div>

       <nav class="nav-menu">
        <a class="nav-item active">秒杀首页</a>
        <a v-if="role !== 'MERCHANT'" class="nav-item" @click="goOrder">
          我的订单
        </a>
      </nav>

        <div class="nav-right">
          <template v-if="userStore.isLogin()">
            <a v-if="role === 'MERCHANT'" class="merchant-entry" @click="goMerchant">
              商家后台
            </a>
            <span class="user-name">{{ userStore.username }}</span>
            <a class="logout" @click="handleLogout">退出</a>
          </template>
          <template v-else>
            <button class="login-btn" @click="showLogin = true">登录 / 注册</button>
          </template>
        </div>
      </div>
    </header>
    <!-- 轮播图 -->
    <div v-if="banners.length > 0" class="banner-section">
      <el-carousel height="400px" :interval="4000" arrow="hover">
        <el-carousel-item v-for="b in banners" :key="b.id">
          <div class="banner-item" @click="onBannerClick(b)">
            <img :src="b.imageUrl" :alt="b.title" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- Hero 横幅 -->
    <section class="hero">
      <div class="hero-grid-bg"></div>
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

          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-num">1000+</div>
              <div class="hero-stat-label">今日已抢</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">100</div>
              <div class="hero-stat-label">剩余库存</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">99%</div>
              <div class="hero-stat-label">抢购成功率</div>
            </div>
          </div>

          <div class="hero-tags">
            <span class="hero-tag-item">✓ 品牌正品</span>
            <span class="hero-tag-item">✓ 假一赔十</span>
            <span class="hero-tag-item">✓ 限时秒杀</span>
            <span class="hero-tag-item">✓ 闪电发货</span>
          </div>
        </div>

        <!-- 图片墙 -->
        <!-- 图片墙 -->
<div class="hero-right">
  <div class="image-wall">
    <div class="wall-column">
      <div class="wall-track wall-track--up">
        <div v-for="(img, i) in wallLeft" :key="'L' + i" class="wall-item">
          <img :src="img" alt="" />
        </div>
        <div v-for="(img, i) in wallLeft" :key="'L-copy' + i" class="wall-item">
          <img :src="img" alt="" />
        </div>
      </div>
    </div>
    <div class="wall-column">
      <div class="wall-track wall-track--down">
        <div v-for="(img, i) in wallMid" :key="'M' + i" class="wall-item">
          <img :src="img" alt="" />
        </div>
        <div v-for="(img, i) in wallMid" :key="'M-copy' + i" class="wall-item">
          <img :src="img" alt="" />
        </div>
      </div>
    </div>
    <div class="wall-column">
      <div class="wall-track wall-track--up">
        <div v-for="(img, i) in wallRight" :key="'R' + i" class="wall-item">
          <img :src="img" alt="" />
        </div>
        <div v-for="(img, i) in wallRight" :key="'R-copy' + i" class="wall-item">
          <img :src="img" alt="" />
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
    </section>

    <!-- 商品区 -->
    <section class="goods-section">
      <div class="marquee">
        <div class="marquee-track">
          <span class="marquee-item">🎉 用户 138****5120 刚刚抢到了 iPhone 16 Pro</span>
          <span class="marquee-item">🎉 用户 186****3847 刚刚抢到了 AirPods Pro 2</span>
          <span class="marquee-item">🎉 用户 150****9912 刚刚抢到了 MacBook Pro 14</span>
          <span class="marquee-item">🎉 用户 139****2233 刚刚抢到了 iPad Pro 12.9</span>
          <span class="marquee-item">🎉 用户 138****5120 刚刚抢到了 iPhone 16 Pro</span>
          <span class="marquee-item">🎉 用户 186****3847 刚刚抢到了 AirPods Pro 2</span>
          <span class="marquee-item">🎉 用户 150****9912 刚刚抢到了 MacBook Pro 14</span>
          <span class="marquee-item">🎉 用户 139****2233 刚刚抢到了 iPad Pro 12.9</span>
        </div>
      </div>

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
            <img :src="goods.coverImg || defaultImage" :alt="goods.title" />
            <div v-if="goods.seckill" class="seckill-badge">🔥 秒杀中</div>
             <div v-if="goods.category && goods.category !== '其他'" class="category-badge">
              {{ goods.category }}
            </div>
          </div>
          <div class="goods-info">
            <h3 class="goods-title">{{ goods.title }}</h3>
            <div class="shop-name">{{ goods.shopName || '官方店铺' }}</div>

            <div class="price-row">
              <template v-if="goods.seckill">
                <span class="price-now">¥{{ goods.seckill.seckillPrice }}</span>
                <span class="price-old">¥{{ goods.price }}</span>
              </template>
              <template v-else>
                <span class="price-now">¥{{ goods.price }}</span>
              </template>
            </div>

            <div v-if="goods.seckill" class="stock-row">
              <div class="stock-bar">
                <div class="stock-fill" :style="{ width: getStockPercent(goods) + '%' }"></div>
              </div>
              <span class="stock-text">仅剩 {{ goods.seckill.stock }} 件</span>
            </div>

            <button
              v-if="goods.seckill && role !== 'MERCHANT'"
              class="buy-btn"
              :disabled="goods.seckill.stock <= 0"
              @click="handleSeckill(goods)"
            >
              {{ goods.seckill.stock <= 0 ? '已抢光' : '立即抢购' }}
            </button>

            <button
              v-else-if="goods.seckill && role === 'MERCHANT'"
              class="buy-btn disabled"
              disabled
            >
              商家不能秒杀
            </button>

            <button v-else class="buy-btn disabled" disabled>
              未参加秒杀
            </button>
          </div>
        </div>
      </div>
    </section>

    <LoginDialog v-model="showLogin" @success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
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
const role = ref('')
const banners = ref([])   // 顶部轮播
const defaultImage = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop'

const wallLeft = ref([])
const wallMid = ref([])
const wallRight = ref([])

// 默认图片墙（后端没数据时用）
const defaultWallLeft = [
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=400&fit=crop',
]
const defaultWallMid = [
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=300&h=400&fit=crop',
]
const defaultWallRight = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=400&fit=crop',
]

// ★ 唯一 loadBanners
const loadBanners = async () => {
  try {
    const res = await request.get('/api/banner/list')
    if (res.code === 200 && res.data) {
      banners.value = res.data.carousel || []
      const left = (res.data.wallLeft || []).map(b => b.imageUrl)
      const mid = (res.data.wallMid || []).map(b => b.imageUrl)
      const right = (res.data.wallRight || []).map(b => b.imageUrl)
      wallLeft.value = left.length ? left : defaultWallLeft
      wallMid.value = mid.length ? mid : defaultWallMid
      wallRight.value = right.length ? right : defaultWallRight
    } else {
      wallLeft.value = defaultWallLeft
      wallMid.value = defaultWallMid
      wallRight.value = defaultWallRight
    }
  } catch (e) {
    console.error('加载轮播图失败', e)
    wallLeft.value = defaultWallLeft
    wallMid.value = defaultWallMid
    wallRight.value = defaultWallRight
  }
}

function onBannerClick(b) {
  if (b.linkUrl) router.push(b.linkUrl)
}

const goodsList = ref([])
const countdown = reactive({ h: '00', m: '00', s: '00' })

const loadGoods = async () => {
  try {
    const params = { pageNum: 1, pageSize: 20 }
    if (activeTab.value && activeTab.value !== '全部') {
      params.category = activeTab.value
    }
    const res = await request.get('/api/product/list', { params })
    if (res.code === 200 && res.data) {
      goodsList.value = res.data.records || []
    }
  } catch (e) {
    console.log('加载商品失败', e)
  }
}

watch(activeTab, () => {
  loadGoods()
})

const handleSeckill = async (goods) => {
  if (!goods.seckill) return
  if (!userStore.isLogin()) {
    showLogin.value = true
    return
  }
  if (role.value === 'MERCHANT') {
    toast.error('商家账号不能参与秒杀')
    return
  }
  try {
    const res = await request.post(`/seckill/${goods.seckill.activityId}`)
    if (res.code === 200) {
      const requestId = res.data.requestId
      toast.info('秒杀成功，正在处理订单...')
      goods.seckill.stock--
      pollResult(requestId, goods)
    } else {
      toast.error(res.message)
    }
  } catch (e) {
    toast.error('秒杀失败', '请稍后重试')
  }
}

const pollResult = (requestId, goods) => {
  let count = 0
  const maxCount = 10
  const timer = setInterval(async () => {
    count++
    if (count > maxCount) {
      clearInterval(timer)
      toast.warning('订单处理超时', '请稍后到订单页查看')
      return
    }
    try {
      const res = await request.get(`/seckill/result/${requestId}`)
      if (res.code === 200) {
        const result = res.data
        if (result.status === 1) {
          clearInterval(timer)
          toast.success('秒杀成功', `订单号：${result.orderNo}`)
        } else if (result.status === 2) {
          clearInterval(timer)
          toast.error('秒杀失败', result.message)
          if (goods.seckill) goods.seckill.stock++
        }
      }
    } catch (e) {}
  }, 1000)
}

const onLoginSuccess = () => {
  toast.success('欢迎回来')
  role.value = sessionStorage.getItem('role') || ''
}

const goOrder = () => {
  if (!userStore.isLogin()) {
    showLogin.value = true
    return
  }
  router.push('/order')
}

const goMerchant = () => {
  router.push('/merchant/products')
}

const handleLogout = async () => {
  try {
    await fetch('/user/logout', { method: 'POST', credentials: 'include' })
  } catch (e) {}
  userStore.clearUser()
  sessionStorage.removeItem('role')
  sessionStorage.removeItem('userName')
  role.value = ''
  toast.info('已退出登录')
}

const getStockPercent = (goods) => {
  if (!goods.seckill) return 0
  const total = goods.seckill.totalStock || 100
  const stock = goods.seckill.stock || 0
  return Math.min(100, (stock / total) * 100)
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
  loadBanners()
  loadGoods()
  startCountdown()
  role.value = sessionStorage.getItem('role') || ''
})
</script>
<style scoped>
/* 你原有的全部样式保持不变 */

.home-page { min-height: 100vh; background: #f7f7f7; color: #222; }

.navbar { background: #000; color: #fff; position: sticky; top: 0; z-index: 100; }
.nav-inner {
  max-width: 1400px; margin: 0 auto; padding: 0 40px; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.logo { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; letter-spacing: 1px; }
.logo-icon { font-size: 22px; }
.logo-text { color: #fff; }
.nav-menu { display: flex; gap: 32px; }
.nav-item { font-size: 14px; color: #999; cursor: pointer; transition: color 0.2s; }
.nav-item:hover, .nav-item.active { color: #fff; }
.nav-right { display: flex; align-items: center; gap: 16px; }

.merchant-entry {
  font-size: 14px; color: #00d4ff; cursor: pointer;
  padding: 4px 10px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  transition: all 0.2s;
}
.merchant-entry:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.user-name { font-size: 14px; color: #fff; }
.logout { font-size: 14px; color: #666; cursor: pointer; transition: color 0.2s; }
.logout:hover { color: #fff; }
.login-btn {
  padding: 8px 20px; background: #fff; color: #000; border: none;
  border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: opacity 0.2s;
}
.login-btn:hover { opacity: 0.85; }

.hero { background: #000; color: #fff; padding: 80px 40px; position: relative; overflow: hidden; }
.hero-grid-bg {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 60px 60px; pointer-events: none;
  mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
}
.hero-inner {
  max-width: 1400px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
  align-items: center; position: relative; z-index: 1;
}
.hero-tag {
  display: inline-block; padding: 6px 14px;
  background: rgba(255, 255, 255, 0.08); border-radius: 4px;
  font-size: 12px; letter-spacing: 3px; color: #999; margin-bottom: 24px;
}
.hero-left h1 { font-size: 64px; font-weight: 800; letter-spacing: 4px; margin-bottom: 20px; }
.hero-left p { font-size: 16px; color: #888; margin-bottom: 48px; letter-spacing: 2px; }
.countdown { display: flex; align-items: center; gap: 20px; }
.cd-label { font-size: 14px; color: #888; }
.cd-time { display: flex; align-items: center; gap: 8px; }
.cd-unit {
  display: inline-block; min-width: 52px; padding: 10px 12px;
  background: rgba(255, 255, 255, 0.08); border-radius: 6px;
  font-size: 26px; font-weight: 700; text-align: center;
  font-family: 'Courier New', monospace;
}
.cd-colon { font-size: 24px; color: #666; }
.hero-stats {
  display: flex; gap: 40px; margin-top: 40px;
  padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.hero-stat { display: flex; flex-direction: column; gap: 6px; }
.hero-stat-num { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 1px; }
.hero-stat-label { font-size: 13px; color: #888; letter-spacing: 1px; }
.hero-tags { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.hero-tag-item {
  padding: 6px 14px; background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 9999px;
  font-size: 13px; color: #aaa; letter-spacing: 0.5px; transition: all 0.2s;
}
.hero-tag-item:hover { border-color: rgba(255, 255, 255, 0.2); color: #fff; }

.hero-right { display: flex; justify-content: flex-end; }
.image-wall {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  height: 460px; overflow: hidden; width: 100%; max-width: 420px;
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
}
.wall-column { position: relative; overflow: hidden; height: 100%; }
.wall-track { display: flex; flex-direction: column; gap: 12px; will-change: transform; }
.wall-track--up { animation: scrollUp 15s linear infinite; }
.wall-track--down { animation: scrollDown 15s linear infinite; }
.wall-item {
  flex-shrink: 0; width: 100%; aspect-ratio: 3 / 4;
  border-radius: 8px; overflow: hidden; background: #0a0a0a;
}
.wall-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
@keyframes scrollUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes scrollDown { from { transform: translateY(-50%); } to { transform: translateY(0); } }

.goods-section { max-width: 1400px; margin: 0 auto; padding: 48px 40px 80px; }

.marquee {
  overflow: hidden; margin-bottom: 40px; padding: 14px 0;
  background: #fff; border-radius: 8px; border: 1px solid #eee; position: relative;
  mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
}
.marquee-track {
  display: flex; gap: 60px; animation: scrollLeft 40s linear infinite; white-space: nowrap;
}
.marquee-item { font-size: 14px; color: #666; letter-spacing: 0.5px; flex-shrink: 0; }
@keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.tabs { display: flex; gap: 36px; border-bottom: 1px solid #e5e5e5; margin-bottom: 40px; }
.tab {
  font-size: 15px; color: #999; cursor: pointer;
  padding-bottom: 16px; border-bottom: 2px solid transparent; transition: all 0.2s;
}
.tab:hover { color: #333; }
.tab.active { color: #000; font-weight: 600; border-bottom-color: #000; }

.goods-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 40px 24px;
}
.goods-card { cursor: pointer; transition: transform 0.3s; }
.goods-card:hover { transform: translateY(-4px); }
.goods-image {
  position: relative; aspect-ratio: 1 / 1; overflow: hidden;
  background: #fafafa; border-radius: 6px; margin-bottom: 16px;
}
.goods-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.goods-card:hover .goods-image img { transform: scale(1.06); }

/* ★ 秒杀标签 */
.seckill-badge {
  position: absolute; top: 12px; left: 12px;
  padding: 4px 10px;
  background: linear-gradient(90deg, #ff4d4f, #ff7a45);
  color: #fff; font-size: 11px; font-weight: 700;
  border-radius: 3px; letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.4);
}

.goods-title {
  font-size: 14px; color: #333; margin-bottom: 6px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ★ 店铺名 */
.shop-name {
  font-size: 12px; color: #999; margin-bottom: 10px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
.price-now { font-size: 22px; font-weight: 700; color: #000; }
.price-old { font-size: 13px; color: #bbb; text-decoration: line-through; }

.stock-row { margin-bottom: 16px; }
.stock-bar {
  height: 4px; background: #eee; border-radius: 2px;
  overflow: hidden; margin-bottom: 6px;
}
.stock-fill { height: 100%; background: #000; transition: width 0.3s; }
.stock-text { font-size: 12px; color: #999; }

.buy-btn {
  width: 100%; height: 42px; background: #000; color: #fff;
  border: none; border-radius: 4px; font-size: 14px; font-weight: 500;
  letter-spacing: 2px; cursor: pointer; transition: background 0.2s;
}
.buy-btn:hover:not(:disabled) { background: #333; }
.buy-btn:disabled { background: #ddd; color: #999; cursor: not-allowed; }
.buy-btn.disabled { background: #ccc !important; color: #fff !important; cursor: not-allowed; }

@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hero-right { justify-content: center; }
}
@media (max-width: 768px) {
  .nav-inner { padding: 0 20px; }
  .nav-menu { display: none; }
  .hero { padding: 48px 20px; }
  .hero-left h1 { font-size: 42px; }
  .hero-stats { flex-wrap: wrap; gap: 24px 32px; }
  .hero-stat-num { font-size: 18px; }
  .hero-tags { display: none; }
  .image-wall { height: 320px; max-width: 100%; }
  .marquee { margin-bottom: 24px; }
  .goods-section { padding: 32px 20px 48px; }
  .goods-grid { grid-template-columns: repeat(2, 1fr); gap: 24px 16px; }
}
.category-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  letter-spacing: 0.5px;
}
.banner-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 40px 0;
}
.banner-item {
  width: 100%; height: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}
.banner-item img {
  width: 100%; height: 100%; object-fit: cover;
}
</style>