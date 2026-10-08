<template>
  <div class="seckill-list">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>秒杀活动</h2>
        <p>管理你的秒杀活动，查看订单 / 补货</p>
      </div>
      <button class="primary-btn" @click="$router.push('/merchant/seckill/edit')">
      + 新建活动
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="query.name"
        placeholder="搜索活动名"
        clearable
        style="width: 220px"
        @keyup.enter="load"
      />
      <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
        <el-option label="未开始" :value="0" />
        <el-option label="进行中" :value="1" />
        <el-option label="已结束" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
      <button class="ghost-btn" @click="load">查询</button>
      <button class="ghost-btn" @click="reset">重置</button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="活动名" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="activity-name">{{ row.name || '未命名' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.seckillPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column label="库存" width="140">
          <template #default="{ row }">
            <div class="stock-cell">
              <span>剩余 {{ row.stock }}</span>
              <span class="total">/ 总 {{ row.totalStock }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="320">
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ formatTime(row.startTime) }}</div>
              <div class="time-end">{{ formatTime(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', statusClass(row.status)]">
              {{ statusText(row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <a v-if="row.status === 0" class="action-link" @click="editActivity(row)">编辑</a>
            <a class="action-link" @click="openOrders(row)">订单</a>
            <a
              v-if="row.status === 1"
              class="action-link"
              @click="openRestock(row)"
            >
              补货
            </a>
            <a
                v-if="row.status === 0 || row.status === 1"
                class="action-link danger"
                @click="handleCancel(row)"
            >
                取消
            </a>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty">
        <div class="empty-icon">⏱</div>
        <p>还没有秒杀活动</p>
      </div>

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

    <!-- 补货弹窗 -->
    <el-dialog
      v-model="restockVisible"
      title="补货"
      width="400px"
      align-center
      :append-to-body="false"
      class="restock-dialog"
    >
      <div class="restock-content">
        <p class="restock-info">
          活动：<strong>{{ restockActivity.name }}</strong>
        </p>
        <p class="restock-info">
          当前库存：<strong>{{ restockActivity.stock }}</strong>
        </p>
        <div class="restock-input">
          <label>补货数量</label>
          <el-input-number v-model="restockCount" :min="1" :max="99999" style="width: 100%" />
        </div>
      </div>
      <template #footer>
        <button class="ghost-btn" @click="restockVisible = false">取消</button>
        <button class="primary-btn" :disabled="restocking" @click="submitRestock">
          {{ restocking ? '处理中...' : '确认补货' }}
        </button>
      </template>
    </el-dialog>

    <!-- 订单弹窗 -->
    <SeckillOrderDialog v-model="orderVisible" :activity="currentActivity" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listSeckillActivities,
  addSeckillStock,
  cancelSeckillActivity
} from '../../api/merchant'
import SeckillOrderDialog from './SeckillOrderDialog.vue'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: null,
})

const restockVisible = ref(false)
const restockActivity = ref({})
const restockCount = ref(10)
const restocking = ref(false)

const orderVisible = ref(false)
const currentActivity = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await listSeckillActivities(query)
    const data = res.data || res
    list.value = data.records || []
    total.value = data.total || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function reset() {
  query.name = ''
  query.status = null
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

function editActivity(row) {
  router.push(`/merchant/seckill/edit/${row.id}`)
}

function openRestock(row) {
  restockActivity.value = row
  restockCount.value = 10
  restockVisible.value = true
}

async function submitRestock() {
  if (restockCount.value <= 0) {
    ElMessage.warning('补货数量必须大于0')
    return
  }
  restocking.value = true
  try {
    const res = await addSeckillStock(restockActivity.value.id, restockCount.value)
    const newStock = res.data || res
    ElMessage.success(`补货成功，当前库存 ${newStock}`)
    restockVisible.value = false
    load()
  } catch (e) {
    ElMessage.error('补货失败')
  } finally {
    restocking.value = false
  }
}

async function handleCancel(row) {
  const tip = row.status === 1
    ? `活动「${row.name}」正在进行中，取消后用户将无法继续秒杀，确定吗？`
    : `确定取消活动「${row.name}」吗？`

  try {
    await ElMessageBox.confirm(tip, '警告', {
      type: 'warning',
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想',
    })
  } catch (e) { return }

  try {
    await cancelSeckillActivity(row.id)
    ElMessage.success('已取消')
    load()
  } catch (e) {
    ElMessage.error('取消失败')
  }
}

function openOrders(row) {
  currentActivity.value = row
  orderVisible.value = true
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
.seckill-list { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 26px; font-weight: 800; letter-spacing: 1px;
  color: #000; margin-bottom: 6px;
}
.page-header p { font-size: 13px; color: #999; }

.filter-bar {
  display: flex; gap: 12px; margin-bottom: 20px; align-items: center;
}

.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px;
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #000; color: #000; }

.primary-btn {
  padding: 10px 22px; background: #000; color: #fff;
  border: none; border-radius: 6px; font-size: 14px;
  font-weight: 600; cursor: pointer; transition: all 0.25s;
}
.primary-btn:hover:not(:disabled) {
  background: #1a1a1a; transform: translateY(-1px);
}
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.table-card {
  background: #fff; border-radius: 12px;
  border: 1px solid #eee; padding: 4px; overflow: hidden;
}

:deep(.el-table) {
  background: transparent; font-size: 14px;
  --el-table-border-color: #f0f0f0;
  --el-table-row-hover-bg-color: #fafafa;
}

.activity-name { font-weight: 600; color: #222; }
.price { font-weight: 700; color: #ff4d4f; font-size: 15px; }

.stock-cell { display: flex; flex-direction: column; gap: 2px; }
.stock-cell .total { font-size: 12px; color: #999; }

.time-cell { font-size: 12px; color: #333; line-height: 1.6; }
.time-end { color: #999; }

.status-tag {
  display: inline-block; padding: 4px 10px; border-radius: 4px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
}
.status-tag.pending { color: #faad14; background: rgba(250, 173, 20, 0.1); }
.status-tag.active { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.ended { color: #888; background: #f5f5f5; }
.status-tag.canceled { color: #999; background: #f5f5f5; }

.action-link {
  font-size: 13px; color: #00a8cc; cursor: pointer;
  margin-left: 16px; transition: all 0.2s;
}
.action-link:hover { color: #00d4ff; }

.empty {
  padding: 60px 20px; text-align: center; color: #999;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

.pager { padding: 20px; display: flex; justify-content: flex-end; }
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #000; color: #fff;
}

.restock-content { padding: 8px 0; }
.restock-info { font-size: 14px; color: #666; margin-bottom: 8px; }
.restock-info strong { color: #000; }
.restock-input { margin-top: 20px; }
.restock-input label {
  display: block; font-size: 13px; color: #333;
  margin-bottom: 8px; font-weight: 600;
}
.action-link.danger {
  color: #ff4d4f;
}

.action-link.danger:hover {
  color: #ff7875;
  text-shadow: 0 0 8px rgba(255, 77, 79, 0.4);
}
</style>