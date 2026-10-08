<template>
  <div class="operation-log">
    <div class="page-header">
      <div>
        <h2>操作日志</h2>
        <p>记录管理员 / 商家的关键操作</p>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="query.keyword"
        placeholder="操作人用户名"
        clearable
        style="width: 220px"
        @keyup.enter="load"
      />
      <el-select
        v-model="query.action"
        placeholder="全部操作"
        clearable
        style="width: 180px"
      >
        <el-option
          v-for="a in actionOptions"
          :key="a.value"
          :label="a.label"
          :value="a.value"
        />
      </el-select>
      <button class="ghost-btn" @click="load">查询</button>
      <button class="ghost-btn" @click="reset">重置</button>
    </div>

    <div class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="操作人" min-width="180">
          <template #default="{ row }">
            <div class="operator-cell">
              <div class="operator-name">{{ row.operatorName || '—' }}</div>
              <div class="operator-role">
                <span :class="['role-tag', roleClass(row.operatorRole)]">
                  {{ roleText(row.operatorRole) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <span class="action-tag">{{ actionText(row.action) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="目标" width="140">
          <template #default="{ row }">
            <span v-if="row.targetType" class="target-text">
              {{ targetText(row.targetType) }}
              <span v-if="row.targetId" class="target-id">#{{ row.targetId }}</span>
            </span>
            <span v-else>—</span>
          </template>
        </el-table-column>

        <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.detail || '—' }}</template>
        </el-table-column>

        <el-table-column prop="ip" label="IP" width="140">
          <template #default="{ row }">{{ row.ip || '—' }}</template>
        </el-table-column>

        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty">
        <div class="empty-icon">📋</div>
        <p>暂无日志</p>
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
import { ElMessage } from 'element-plus'
import { listOperationLogs } from '../../api/admin'

const loading = ref(false)
const list = ref([])
const total = ref(0)

const actionOptions = [
  { label: '审核商家', value: 'AUDIT_MERCHANT' },
  { label: '审核商品', value: 'AUDIT_PRODUCT' },
  { label: '强制下架', value: 'FORCE_OFF_PRODUCT' },
  { label: '封禁用户', value: 'BAN_USER' },
  { label: '解封用户', value: 'UNBAN_USER' },
  { label: '新增轮播图', value: 'SAVE_BANNER' },
  { label: '删除轮播图', value: 'DELETE_BANNER' },
]

const query = reactive({
  pageNum: 1,
  pageSize: 20,
  action: null,
  keyword: '',
})

async function load() {
  loading.value = true
  try {
    const res = await listOperationLogs(query)
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
  query.action = null
  query.keyword = ''
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

// ============ 显示映射 ============
function actionText(a) {
  return {
    AUDIT_MERCHANT: '审核商家',
    AUDIT_PRODUCT: '审核商品',
    FORCE_OFF_PRODUCT: '强制下架',
    BAN_USER: '封禁用户',
    UNBAN_USER: '解封用户',
    SAVE_BANNER: '保存轮播图',
    DELETE_BANNER: '删除轮播图',
  }[a] || a
}

function targetText(t) {
  return {
    MERCHANT: '商家',
    PRODUCT: '商品',
    USER: '用户',
    BANNER: '轮播图',
    ORDER: '订单',
  }[t] || t
}

function roleText(r) {
  return { ADMIN: '管理员', MERCHANT: '商家', USER: '买家' }[r] || r
}

function roleClass(r) {
  return { ADMIN: 'admin', MERCHANT: 'merchant', USER: 'user' }[r] || ''
}

function formatTime(t) {
  if (!t) return '—'
  return t.replace('T', ' ').substring(0, 19)
}

onMounted(load)
</script>

<style scoped>
.operation-log { max-width: 1400px; }

.page-header { margin-bottom: 24px; }
.page-header h2 {
  font-size: 26px; font-weight: 800; color: #000; margin-bottom: 6px;
}
.page-header p { font-size: 13px; color: #999; }

.filter-bar {
  display: flex; gap: 12px; margin-bottom: 20px; align-items: center;
}

.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px; font-size: 13px; cursor: pointer;
}
.ghost-btn:hover { border-color: #000; color: #000; }

.table-card {
  background: #fff; border-radius: 12px; border: 1px solid #eee; padding: 4px;
}

/* 操作人 */
.operator-cell { display: flex; flex-direction: column; gap: 4px; }
.operator-name { font-size: 14px; font-weight: 600; color: #222; }
.operator-role { line-height: 1; }

.role-tag {
  display: inline-block; padding: 2px 8px; border-radius: 3px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
}
.role-tag.admin { color: #7b2ff7; background: rgba(123, 47, 247, 0.1); }
.role-tag.merchant { color: #00a8cc; background: rgba(0, 168, 204, 0.1); }
.role-tag.user { color: #666; background: #f5f5f5; }

/* 操作标签 */
.action-tag {
  display: inline-block; padding: 4px 10px; border-radius: 4px;
  font-size: 12px; font-weight: 600;
  color: #00a854; background: rgba(0, 168, 84, 0.08);
}

/* 目标 */
.target-text { font-size: 13px; color: #333; }
.target-id {
  font-family: 'Courier New', monospace;
  font-size: 12px; color: #999; margin-left: 4px;
}

/* 空 */
.empty { padding: 60px 20px; text-align: center; color: #999; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

/* 分页 */
.pager { padding: 20px; display: flex; justify-content: flex-end; }
</style>