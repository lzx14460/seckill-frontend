<template>
  <div class="product-stats">
    <div class="page-header">
      <div>
        <h2>商品数据</h2>
        <p>{{ productTitle }}</p>
      </div>
      <button class="ghost-btn" @click="$router.back()">← 返回</button>
    </div>

    <!-- 数据卡片 -->
    <div class="stat-grid">
      <div class="stat-card primary">
        <div class="stat-label">累计订单</div>
        <div class="stat-value">{{ stats.totalOrderCount || 0 }}</div>
        <div class="stat-unit">单</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">累计销售额</div>
        <div class="stat-value">¥{{ formatMoney(stats.totalSales) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">秒杀活动数</div>
        <div class="stat-value">{{ (stats.activities || []).length }}</div>
        <div class="stat-unit">个</div>
      </div>
    </div>

    <!-- 近 7 天趋势 -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>近 7 天订单趋势</h3>
      </div>
      <div class="chart">
        <div v-for="(d, i) in stats.recentDays || []" :key="i" class="bar-item">
          <div class="bar-wrap">
            <div
              class="bar"
              :style="{ height: getBarHeight(d.orderCount) + '%' }"
              :title="`${d.date}：${d.orderCount} 单 / ¥${d.sales}`"
            >
              <span class="bar-value">{{ d.orderCount }}</span>
            </div>
          </div>
          <div class="bar-date">{{ d.date }}</div>
        </div>
      </div>
    </div>

    <!-- 活动明细 -->
    <div class="activity-card">
      <div class="section-title">秒杀活动明细</div>
      <el-table :data="stats.activities || []" style="width: 100%">
        <el-table-column prop="name" label="活动名" min-width="160" />
        <el-table-column label="秒杀价" width="110">
          <template #default="{ row }">
            <span class="price">¥{{ row.seckillPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="130">
          <template #default="{ row }">
            剩 {{ row.stock }} / 总 {{ row.totalStock }}
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="100">
          <template #default="{ row }">
            <strong>{{ row.orderCount }}</strong> 单
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', statusClass(row.status)]">
              {{ statusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="200">
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ formatTime(row.startTime) }}</div>
              <div class="time-end">{{ formatTime(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductStats } from '../../api/merchant'

const route = useRoute()
const stats = ref({})

const productTitle = computed(() => stats.value.productTitle || '')

async function load() {
  try {
    const res = await getProductStats(route.params.id)
    if (res.code === 200) stats.value = res.data || {}
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

function formatMoney(m) {
  if (!m) return '0.00'
  return Number(m).toFixed(2)
}

function getBarHeight(count) {
  const list = stats.value.recentDays || []
  const max = Math.max(...list.map(d => d.orderCount), 1)
  if (!count) return 5
  return Math.max(5, (count / max) * 100)
}

function statusText(s) {
  return { 0: '未开始', 1: '进行中', 2: '已结束', 3: '已取消' }[s] || '未知'
}
function statusClass(s) {
  return { 0: 'pending', 1: 'active', 2: 'ended', 3: 'canceled' }[s] || ''
}
function formatTime(t) {
  if (!t) return '—'
  return t.replace('T', ' ').substring(0, 16)
}

onMounted(load)
</script>

<style scoped>
.product-stats { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 26px; font-weight: 800; letter-spacing: 1px;
  color: #000; margin-bottom: 6px;
}
.page-header p { font-size: 13px; color: #999; }

.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px;
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #000; color: #000; }

.stat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px; margin-bottom: 24px;
}
.stat-card {
  background: #fff; border-radius: 12px; border: 1px solid #eee;
  padding: 24px;
}
.stat-card.primary {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  border-color: #000; color: #fff;
}
.stat-card.primary .stat-label { color: #aaa; }
.stat-label { font-size: 13px; color: #999; margin-bottom: 12px; }
.stat-value { font-size: 32px; font-weight: 800; color: #000; letter-spacing: 1px; }
.stat-card.primary .stat-value { color: #fff; }
.stat-unit { font-size: 13px; color: #bbb; margin-top: 6px; }

.chart-card {
  background: #fff; border-radius: 12px; border: 1px solid #eee;
  padding: 24px 28px; margin-bottom: 24px;
}
.chart-header h3 {
  font-size: 15px; font-weight: 700; color: #000; letter-spacing: 1px;
  margin-bottom: 24px;
}
.chart {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 12px; height: 200px; padding: 0 8px;
}
.bar-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; height: 100%;
}
.bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.bar {
  width: 60%; min-height: 4px;
  background: linear-gradient(180deg, #00d4ff, #7b2ff7);
  border-radius: 6px 6px 0 0; position: relative; transition: all 0.3s;
}
.bar-value {
  position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
  font-size: 12px; font-weight: 700; color: #000;
}
.bar-date { font-size: 12px; color: #999; margin-top: 12px; }

.activity-card {
  background: #fff; border-radius: 12px; border: 1px solid #eee;
  padding: 24px 28px;
}
.section-title {
  font-size: 13px; font-weight: 700; color: #000;
  letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 20px; position: relative; padding-left: 12px;
}
.section-title::before {
  content: ''; position: absolute; left: 0; top: 50%;
  transform: translateY(-50%); width: 3px; height: 14px;
  background: linear-gradient(180deg, #00d4ff, #7b2ff7);
  border-radius: 2px;
}
.price { color: #ff4d4f; font-weight: 700; }
.status-tag {
  display: inline-block; padding: 4px 10px; border-radius: 4px;
  font-size: 12px; font-weight: 600;
}
.status-tag.pending { color: #faad14; background: rgba(250, 173, 20, 0.1); }
.status-tag.active { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.ended { color: #888; background: #f5f5f5; }
.status-tag.canceled { color: #999; background: #f5f5f5; }
.time-cell { font-size: 12px; color: #333; line-height: 1.6; }
.time-end { color: #999; }
</style>