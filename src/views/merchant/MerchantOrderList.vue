<template>
  <div class="order-list">
    <div class="page-header">
      <div>
        <h2>订单管理</h2>
        <p>处理你的秒杀订单</p>
      </div>
      <!-- ★ 加导出按钮 -->
      <button class="primary-btn" @click="handleExport" :disabled="exporting">
        {{ exporting ? '导出中...' : '⬇ 导出 Excel' }}
      </button>
    </div>

    <!-- 筛选（不变） -->
    <div class="filter-bar">
      <el-input
        v-model="query.orderNo"
        placeholder="订单号"
        clearable
        style="width: 220px"
        @keyup.enter="load"
      />
      <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
        <el-option label="待发货" :value="0" />
        <el-option label="已发货" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
      <button class="ghost-btn" @click="load">查询</button>
      <button class="ghost-btn" @click="reset">重置</button>
    </div>

    <!-- 表格（不变） -->
    <div class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="productTitle" label="商品" min-width="160" show-overflow-tooltip />
        <el-table-column prop="activityName" label="活动" min-width="120" show-overflow-tooltip />
        <el-table-column label="成交价" width="110">
          <template #default="{ row }">
            <span class="price">¥{{ row.seckillPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', statusClass(row.status)]">
              {{ statusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="right">
          <template #default="{ row }">
            <a v-if="row.status === 0" class="action-link" @click="handleStatus(row, 1)">发货</a>
            <a v-if="row.status === 1" class="action-link" @click="handleStatus(row, 2)">完成</a>
            <a v-if="row.status === 0 || row.status === 1" class="action-link danger" @click="handleStatus(row, 3)">取消</a>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty">
        <div class="empty-icon">📋</div>
        <p>暂无订单</p>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMerchantOrders, updateOrderStatus } from '../../api/merchant'

const loading = ref(false)
const exporting = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  status: null,
})

async function load() {
  loading.value = true
  try {
    const res = await listMerchantOrders(query)
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
  query.orderNo = ''
  query.status = null
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

async function handleStatus(row, targetStatus) {
  const textMap = { 1: '发货', 2: '完成', 3: '取消' }
  const text = textMap[targetStatus]

  try {
    await ElMessageBox.confirm(`确定要${text}订单「${row.orderNo}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: `确认${text}`,
    })
  } catch (e) { return }

  try {
    await updateOrderStatus(row.id, targetStatus)
    ElMessage.success(`${text}成功`)
    load()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// ★ 导出 Excel
async function handleExport() {
  exporting.value = true
  try {
    const response = await fetch('http://localhost:8080/api/merchant/order/export', {
      credentials: 'include',
    })
    if (!response.ok) {
      ElMessage.error('导出失败：' + response.status)
      return
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `订单_${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

function statusText(s) {
  return { 0: '待发货', 1: '已发货', 2: '已完成', 3: '已取消' }[s] || '未知'
}

function statusClass(s) {
  return { 0: 'pending', 1: 'active', 2: 'ended', 3: 'canceled' }[s] || ''
}

function formatTime(t) {
  if (!t) return '—'
  return t.replace('T', ' ').substring(0, 19)
}

onMounted(load)
</script>

<style scoped>
/* 你原有的样式 + 加 .primary-btn */

.order-list { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 26px; font-weight: 800; letter-spacing: 1px;
  color: #000; margin-bottom: 6px;
}
.page-header p { font-size: 13px; color: #999; }

/* ★ 新增：主按钮 */
.primary-btn {
  padding: 10px 22px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.25s;
}
.primary-btn:hover:not(:disabled) {
  background: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-bar {
  display: flex; gap: 12px; margin-bottom: 20px; align-items: center;
}
.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px;
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #000; color: #000; }

.table-card {
  background: #fff; border-radius: 12px;
  border: 1px solid #eee; padding: 4px;
}
:deep(.el-table) {
  background: transparent; font-size: 14px;
  --el-table-border-color: #f0f0f0;
}

.price { color: #ff4d4f; font-weight: 700; }

.status-tag {
  display: inline-block; padding: 4px 10px; border-radius: 4px;
  font-size: 12px; font-weight: 600;
}
.status-tag.pending { color: #faad14; background: rgba(250, 173, 20, 0.1); }
.status-tag.active { color: #1890ff; background: rgba(24, 144, 255, 0.1); }
.status-tag.ended { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.canceled { color: #999; background: #f5f5f5; }

.action-link {
  font-size: 13px; color: #00a8cc; cursor: pointer;
  margin-left: 16px;
}
.action-link:hover { color: #00d4ff; }
.action-link.danger { color: #ff4d4f; }
.action-link.danger:hover { color: #ff7875; }

.empty {
  padding: 60px 20px; text-align: center; color: #999;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

.pager { padding: 20px; display: flex; justify-content: flex-end; }
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #000; color: #fff;
}
</style>