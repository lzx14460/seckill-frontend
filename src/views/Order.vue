<template>
  <div class="order-page">
    <!-- 顶部导航 -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="logo" @click="$router.push('/home')">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">闪购</span>
        </div>
        <nav class="nav-menu">
          <a class="nav-item" @click="$router.push('/home')">秒杀首页</a>
          <a class="nav-item active">我的订单</a>
        </nav>
        <div class="nav-right">
          <span class="user-name">{{ userName }}</span>
          <a class="logout" @click="handleLogout">退出</a>
        </div>
      </div>
    </header>

    <div class="container">
      <div class="page-header">
        <h2>我的订单</h2>
        <p>管理你的秒杀订单</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stat-row">
        <div class="stat-item" :class="{ active: query.status === null }" @click="setStatus(null)">
          <div class="stat-num">{{ stats.total || 0 }}</div>
          <div class="stat-label">全部订单</div>
        </div>
        <div class="stat-item" :class="{ active: query.status === 0 }" @click="setStatus(0)">
          <div class="stat-num">{{ stats.pending || 0 }}</div>
          <div class="stat-label">待发货</div>
        </div>
        <div class="stat-item" :class="{ active: query.status === 1 }" @click="setStatus(1)">
          <div class="stat-num">{{ stats.shipping || 0 }}</div>
          <div class="stat-label">已发货</div>
        </div>
        <div class="stat-item" :class="{ active: query.status === 2 }" @click="setStatus(2)">
          <div class="stat-num">{{ stats.done || 0 }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div v-else-if="list.length === 0" class="empty">
          <div class="empty-icon">📦</div>
          <p>暂无订单</p>
          <button class="empty-btn" @click="$router.push('/home')">去逛逛</button>
        </div>

        <div v-else class="order-cards">
          <div v-for="order in list" :key="order.id" class="order-card">
            <!-- 头部：订单号 + 状态 -->
            <div class="card-header">
              <div class="order-no">
                <span class="label">订单号</span>
                <span class="value">{{ order.orderNo }}</span>
              </div>
              <span :class="['status-tag', statusClass(order.status)]">
                {{ statusText(order.status) }}
              </span>
            </div>

            <!-- 主体：商品信息 -->
            <div class="card-body">
              <div class="product-cover">
                <img :src="order.coverImg || defaultCover" alt="" />
              </div>
              <div class="product-info">
                <div class="product-title">{{ order.productTitle || '秒杀商品' }}</div>
                <div class="product-activity">{{ order.activityName || '限时秒杀' }}</div>
                <div class="product-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-num">{{ order.seckillPrice }}</span>
                </div>
              </div>
              <div class="product-qty">
                <span>x1</span>
              </div>
            </div>

            <!-- 底部：时间 + 操作 -->
            <div class="card-footer">
              <div class="order-time">
                <span class="time-label">下单时间</span>
                <span class="time-value">{{ formatTime(order.createTime) }}</span>
              </div>
              <div class="order-actions">
                <button
                  v-if="order.status === 0"
                  class="btn-cancel"
                  @click="handleCancel(order)"
                >
                  取消订单
                </button>
                <button
                  v-if="order.status === 2"
                  class="btn-rebuy"
                  @click="$router.push('/home')"
                >
                  再买一单
                </button>
                <button class="btn-detail" @click="showDetail(order)">查看详情</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pager">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            @current-change="onPageChange"
          />
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
   
    <el-dialog
      v-model="detailVisible"
      width="460px"
      align-center
      :show-close="false"
      class="order-detail-dialog"
      :append-to-body="false"
    >
      <div v-if="currentOrder" class="detail-content">
        <!-- 关闭按钮 -->
        <div class="detail-close" @click="detailVisible = false">✕</div>

        <!-- 头部状态条 -->
        <div class="detail-header" :class="statusClass(currentOrder.status)">
          <div class="dh-icon">{{ statusIcon(currentOrder.status) }}</div>
          <div class="dh-text">
            <div class="dh-title">{{ statusText(currentOrder.status) }}</div>
            <div class="dh-sub">{{ statusSub(currentOrder.status) }}</div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-product">
          <div class="dp-cover">
            <img :src="currentOrder.coverImg || defaultCover" alt="" />
          </div>
          <div class="dp-info">
            <div class="dp-title">{{ currentOrder.productTitle || '秒杀商品' }}</div>
            <div class="dp-activity">
              <span class="dp-activity-tag">限时秒杀</span>
              {{ currentOrder.activityName }}
            </div>
            <div class="dp-price">¥{{ currentOrder.seckillPrice }}</div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">订单号</span>
            <span class="info-value mono">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">下单时间</span>
            <span class="info-value">{{ formatTime(currentOrder.createTime) }}</span>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="detail-actions">
          <button
            v-if="currentOrder.status === 0"
            class="btn-ghost"
            @click="handleCancel(currentOrder); detailVisible = false"
          >
            取消订单
          </button>
          <button
            v-if="currentOrder.status === 2"
            class="btn-ghost"
            @click="$router.push('/home')"
          >
            再买一单
          </button>
          <button class="btn-primary" @click="detailVisible = false">知道了</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMyOrders, cancelMyOrder, getMyOrderStats } from '../api/order'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const userName = computed(() => sessionStorage.getItem('userName') || '用户')

const defaultCover = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const stats = ref({})

const query = reactive({
  pageNum: 1,
  pageSize: 5,
  status: null,
  orderNo: '',
})

const detailVisible = ref(false)
const currentOrder = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await listMyOrders(query)
    const data = res.data || res
    list.value = data.records || []
    total.value = data.total || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await getMyOrderStats()
    stats.value = res.data || {}
  } catch (e) {}
}

function setStatus(s) {
  query.status = s
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

async function handleCancel(order) {
  try {
    await ElMessageBox.confirm(
      `确定取消订单「${order.orderNo}」吗？`,
      '提示',
      { type: 'warning', confirmButtonText: '确认取消', cancelButtonText: '再想想' }
    )
  } catch (e) { return }

  try {
    await cancelMyOrder(order.id)
    ElMessage.success('已取消')
    load()
    loadStats()
  } catch (e) {
    ElMessage.error('取消失败')
  }
}

function showDetail(order) {
  currentOrder.value = order
  detailVisible.value = true
}

function handleLogout() {
  userStore.clearUser()
  sessionStorage.clear()
  router.push('/home')
}

function statusText(s) {
  return { 0: '待发货', 1: '已发货', 2: '已完成', 3: '已取消' }[s] || '未知'
}
function statusClass(s) {
  return { 0: 'pending', 1: 'shipping', 2: 'done', 3: 'canceled' }[s] || ''
}
function formatTime(t) {
  if (!t) return '—'
  return t.replace('T', ' ').substring(0, 19)
}
function statusIcon(s) {
  return { 0: '⏱', 1: '🚚', 2: '✓', 3: '✕' }[s] || '?'
}

function statusSub(s) {
  return {
    0: '商家正在准备你的商品',
    1: '商品已发出，请留意物流',
    2: '订单已完成，感谢购买',
    3: '订单已取消',
  }[s] || ''
}

onMounted(() => {
  const role = sessionStorage.getItem('role')
  if (role === 'MERCHANT') {
    ElMessage.warning('商家不能查看用户订单')
    router.push('/merchant/dashboard')
    return
  }
  load()
  loadStats()
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f7f7f7;
  color: #222;
}

/* 导航（照搬 Home） */
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
  font-size: 20px; font-weight: 800; letter-spacing: 1px;
  cursor: pointer;
}
.logo-icon { font-size: 22px; }
.logo-text { color: #fff; }
.nav-menu { display: flex; gap: 32px; }
.nav-item {
  font-size: 14px; color: #999; cursor: pointer; transition: color 0.2s;
}
.nav-item:hover, .nav-item.active { color: #fff; }
.nav-right { display: flex; align-items: center; gap: 16px; }
.user-name { font-size: 14px; color: #fff; }
.logout { font-size: 14px; color: #666; cursor: pointer; transition: color 0.2s; }
.logout:hover { color: #fff; }

/* 容器 */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 40px 60px;
}

.page-header {
  margin-bottom: 28px;
}
.page-header h2 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 6px;
}
.page-header p { font-size: 13px; color: #999; }

/* 统计行 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-item:hover {
  border-color: #ccc;
}

.stat-item.active {
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-num {
  font-size: 24px;
  font-weight: 800;
  color: #000;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  letter-spacing: 0.5px;
}

/* 订单卡片列表 */
.order-list {
  min-height: 400px;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
  transition: all 0.25s;
}

.order-card:hover {
  border-color: #ddd;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
}

.order-no .label { color: #999; }
.order-no .value {
  color: #333;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.status-tag.pending { color: #faad14; background: rgba(250, 173, 20, 0.1); }
.status-tag.shipping { color: #1890ff; background: rgba(24, 144, 255, 0.1); }
.status-tag.done { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.canceled { color: #999; background: #f5f5f5; }

.card-body {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
}

.product-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.product-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-activity {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
  padding: 2px 8px;
  background: rgba(255, 77, 79, 0.06);
  border-radius: 3px;
  display: inline-block;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: #ff4d4f;
  font-weight: 700;
}

.price-symbol { font-size: 14px; }
.price-num { font-size: 20px; letter-spacing: -0.5px; }

.product-qty {
  font-size: 14px;
  color: #999;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-top: 1px solid #f0f0f0;
}

.order-time {
  display: flex;
  gap: 10px;
  font-size: 13px;
}

.time-label { color: #999; }
.time-value { color: #666; font-family: 'Courier New', monospace; }

.order-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-rebuy,
.btn-detail {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-cancel {
  background: #fff;
  color: #666;
  border-color: #e5e5e5;
}
.btn-cancel:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.btn-rebuy {
  background: #fff;
  color: #666;
  border-color: #e5e5e5;
}
.btn-rebuy:hover {
  border-color: #000;
  color: #000;
}

.btn-detail {
  background: #000;
  color: #fff;
  border-color: #000;
}
.btn-detail:hover {
  background: #333;
  border-color: #333;
}

/* 加载中 / 空 */
.loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty {
  padding: 80px 20px;
  text-align: center;
  color: #999;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
}

.empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.5; }
.empty p { font-size: 14px; margin-bottom: 20px; }

.empty-btn {
  padding: 10px 28px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.empty-btn:hover { background: #333; }

/* 分页 */
.pager {
  padding: 32px 0 0;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #000;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #000;
}

/* ============================================================
   订单详情弹窗
   ============================================================ */

:deep(.order-detail-dialog) {
  background: #141414 !important;
  border: 1px solid #2a2a2a !important;
  border-radius: 16px !important;
  overflow: hidden;
  padding: 0 !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
}

:deep(.order-detail-dialog .el-dialog__header) {
  display: none !important;
}

:deep(.order-detail-dialog .el-dialog__body) {
  padding: 0 !important;
  background: #141414 !important;
}

.detail-content {
  position: relative;
  color: #fff;
}

/* 关闭按钮 */
.detail-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 10;
}

.detail-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

/* 头部状态条 */
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid #222;
}

.detail-header.pending {
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.12), rgba(250, 173, 20, 0.03));
  border-bottom-color: rgba(250, 173, 20, 0.2);
}

.detail-header.shipping {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(24, 144, 255, 0.03));
  border-bottom-color: rgba(24, 144, 255, 0.2);
}

.detail-header.done {
  background: linear-gradient(135deg, rgba(0, 168, 84, 0.12), rgba(0, 168, 84, 0.03));
  border-bottom-color: rgba(0, 168, 84, 0.2);
}

.detail-header.canceled {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
}

.dh-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.detail-header.pending .dh-icon {
  background: rgba(250, 173, 20, 0.15);
  color: #faad14;
}

.detail-header.shipping .dh-icon {
  background: rgba(24, 144, 255, 0.15);
  color: #1890ff;
}

.detail-header.done .dh-icon {
  background: rgba(0, 168, 84, 0.15);
  color: #00a854;
}

.detail-header.canceled .dh-icon {
  background: rgba(255, 255, 255, 0.06);
  color: #888;
}

.dh-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.detail-header.pending .dh-title { color: #faad14; }
.detail-header.shipping .dh-title { color: #1890ff; }
.detail-header.done .dh-title { color: #00a854; }
.detail-header.canceled .dh-title { color: #888; }

.dh-sub {
  font-size: 12px;
  color: #777;
}

/* 商品信息 */
.detail-product {
  display: flex;
  gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid #1f1f1f;
}

.dp-cover {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #222;
}

.dp-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dp-info {
  flex: 1;
  min-width: 0;
}

.dp-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dp-activity {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
}

.dp-activity-tag {
  padding: 2px 8px;
  background: rgba(255, 77, 79, 0.12);
  color: #ff4d4f;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

.dp-price {
  font-size: 20px;
  font-weight: 800;
  color: #ff4d4f;
  letter-spacing: -0.5px;
}

/* 订单信息 */
.detail-info {
  padding: 20px 28px;
  border-bottom: 1px solid #1f1f1f;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
}

.info-label {
  color: #777;
}

.info-value {
  color: #ccc;
  font-weight: 500;
}

.info-value.mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  color: #fff;
}

/* 底部按钮 */
.detail-actions {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  justify-content: flex-end;
}

.btn-ghost,
.btn-primary {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-ghost {
  background: transparent;
  color: #ccc;
  border-color: #2a2a2a;
}

.btn-ghost:hover {
  border-color: #444;
  color: #fff;
}

.btn-primary {
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
}





@media (max-width: 768px) {
  .nav-inner { padding: 0 20px; }
  .nav-menu { display: none; }
  .container { padding: 20px 16px 40px; }
  .stat-row { grid-template-columns: repeat(2, 1fr); }
  .card-body { flex-wrap: wrap; }
  .card-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
}
</style>