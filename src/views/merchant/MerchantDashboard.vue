<template>
  <div class="dashboard">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>数据看板</h2>
        <p>实时掌握店铺经营情况</p>
      </div>
      <div class="time-filter">
        <button
          v-for="t in timeOptions"
          :key="t.value"
          :class="['tf-btn', activeTime === t.value ? 'active' : '']"
          @click="activeTime = t.value"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">今日订单</div>
        <div class="stat-value">
          <span class="num">{{ displayOrderCount }}</span>
          <span class="unit">单</span>
        </div>
        <div class="stat-footer">
          <span class="tag">↑ 12.5%</span>
          较昨日
        </div>
      </div>

      <div class="stat-card highlight">
        <div class="stat-label">今日销售额</div>
        <div class="stat-value">
          <span class="currency">¥</span>
          <span class="num">{{ displaySales }}</span>
        </div>
        <div class="stat-footer">
          <span class="tag">↑ 8.3%</span>
          较昨日
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">进行中活动</div>
        <div class="stat-value">
          <span class="num">{{ stats.activeActivityCount || 0 }}</span>
          <span class="unit">个</span>
        </div>
        <div class="stat-footer">
          共 {{ stats.totalProductCount || 0 }} 个商品
        </div>
      </div>

      <div class="stat-card" :class="{ warn: (stats.lowStockCount || 0) > 0 }">
        <div class="stat-label">低库存商品</div>
        <div class="stat-value">
          <span class="num">{{ stats.lowStockCount || 0 }}</span>
          <span class="unit">个</span>
        </div>
        <div class="stat-footer">
          {{ (stats.lowStockCount || 0) > 0 ? '⚠ 需要补货' : '库存健康' }}
        </div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="chart-panel">
      <div class="panel-header">
        <div>
          <h3>近 7 天订单趋势</h3>
          <p class="panel-sub">每日秒杀订单数</p>
        </div>
        <div class="chart-legend">
          <span class="legend-dot"></span>
          <span>订单数</span>
        </div>
      </div>

      <div class="chart-area">
        <svg viewBox="0 0 700 220" class="line-chart" preserveAspectRatio="none">
          <g class="grid">
            <line v-for="i in 5" :key="i" x1="0" :y1="i * 40" x2="700" :y2="i * 40"
                  stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
          </g>

          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#00a8cc" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#00a8cc" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <path :d="areaPath" fill="url(#areaGrad)" />

          <polyline
            :points="linePoints"
            fill="none"
            stroke="#00a8cc"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <g>
            <circle
              v-for="(p, i) in chartPoints"
              :key="i"
              :cx="p.x" :cy="p.y"
              r="4"
              fill="#fff"
              stroke="#00a8cc"
              stroke-width="2"
            />
          </g>
        </svg>

        <div class="x-axis">
          <span v-for="(d, i) in stats.recentDays || []" :key="i" class="x-label">
            {{ d.date }}
          </span>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-panel">
      <div class="panel-header-mini">
        <h3>快捷操作</h3>
      </div>
      <div class="quick-grid">
        <div class="quick-item" @click="$router.push('/merchant/products/edit')">
          <div class="qi-icon-wrap">📦</div>
          <div class="qi-title">新增商品</div>
          <div class="qi-desc">发布新商品</div>
        </div>
        <div class="quick-item" @click="$router.push('/merchant/seckill/edit')">
          <div class="qi-icon-wrap">🔥</div>
          <div class="qi-title">新建秒杀</div>
          <div class="qi-desc">创建活动</div>
        </div>
        <div class="quick-item" @click="$router.push('/merchant/products')">
          <div class="qi-icon-wrap">📋</div>
          <div class="qi-title">商品列表</div>
          <div class="qi-desc">管理商品</div>
        </div>
        <div class="quick-item" @click="$router.push('/merchant/orders')">
          <div class="qi-icon-wrap">📮</div>
          <div class="qi-title">订单管理</div>
          <div class="qi-desc">处理订单</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboardStats } from '../../api/merchant'

const stats = ref({})
const activeTime = ref('today')
const timeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
]

const displayOrderCount = ref(0)
const displaySales = ref('0.00')

function animateNumber(target, refVar, isDecimal = false) {
  const duration = 900
  const startTime = Date.now()
  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = target * eased
    refVar.value = isDecimal ? current.toFixed(2) : Math.floor(current)
    if (progress >= 1) clearInterval(timer)
  }, 16)
}

async function load() {
  try {
    const res = await getDashboardStats()
    if (res.code === 200) {
      stats.value = res.data || {}
      animateNumber(stats.value.todayOrderCount || 0, displayOrderCount)
      animateNumber(stats.value.todaySales || 0, displaySales, true)
    }
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const chartPoints = computed(() => {
  const days = stats.value.recentDays || []
  if (days.length === 0) return []
  const max = Math.max(...days.map(d => d.orderCount), 1)
  const w = 700, h = 200, padY = 20
  return days.map((d, i) => {
    const x = (i / (days.length - 1)) * w
    const y = h - padY - (d.orderCount / max) * (h - padY * 2)
    return { x, y }
  })
})

const linePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.y}`).join(' '))

const areaPath = computed(() => {
  const points = chartPoints.value
  if (points.length === 0) return ''
  return `M ${points[0].x},220 ` +
    points.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},220 Z`
})

onMounted(load)
</script>

<style scoped>
.dashboard { max-width: 1200px; color: #222; }

/* 页头 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 13px;
  color: #999;
  letter-spacing: 0.5px;
}

.time-filter {
  display: flex;
  gap: 6px;
  background: #fff;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.tf-btn {
  padding: 7px 16px;
  font-size: 13px;
  color: #666;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tf-btn:hover { color: #000; }

.tf-btn.active {
  color: #fff;
  background: #000;
}

/* 统计卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 22px 24px;
  transition: all 0.25s;
}

.stat-card:hover {
  border-color: #ddd;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #f8fdff 0%, #ffffff 100%);
  border-color: #d6f0f7;
}

.stat-card.warn {
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
  border-color: #ffd6d6;
}

.stat-label {
  font-size: 13px;
  color: #999;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 10px;
}

.stat-value .num {
  font-size: 32px;
  font-weight: 800;
  color: #000;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.stat-card.warn .stat-value .num { color: #ff4d4f; }

.stat-value .currency {
  font-size: 18px;
  font-weight: 700;
  color: #00a8cc;
}

.stat-value .unit {
  font-size: 13px;
  color: #999;
}

.stat-footer {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag { color: #00a854; font-weight: 600; }

/* 趋势图 */
.chart-panel {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: #000;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.panel-sub { font-size: 12px; color: #999; }

.chart-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a8cc;
}

.chart-area { position: relative; }

.line-chart {
  width: 100%;
  height: 220px;
  display: block;
}

.x-axis {
  display: flex;
  justify-content: space-between;
  padding: 8px 0 0;
}

.x-label {
  font-size: 12px;
  color: #999;
  flex: 1;
  text-align: center;
}

/* 快捷入口 */
.quick-panel {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px 28px;
}

.panel-header-mini h3 {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 20px;
  position: relative;
  padding-left: 12px;
}

.panel-header-mini h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #00d4ff, #7b2ff7);
  border-radius: 2px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-item {
  padding: 20px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
}

.quick-item:hover {
  background: #fff;
  border-color: #000;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.qi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin: 0 auto 12px;
  background: #fff;
  border: 1px solid #eee;
}

.qi-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.qi-desc {
  font-size: 12px;
  color: #999;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .stat-grid { grid-template-columns: 1fr; }
  .stat-value .num { font-size: 26px; }
}
</style>