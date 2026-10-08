<template>
  <div class="merchant-audit">
    <div class="page-header">
      <div>
        <h2>商家审核</h2>
        <p>审核商家入驻申请</p>
      </div>
    </div>

    <div class="filter-bar">
      <el-input v-model="query.keyword" placeholder="用户名 / 店铺名" clearable style="width: 220px" @keyup.enter="load" />
      <el-select v-model="query.auditStatus" placeholder="全部状态" clearable style="width: 140px">
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已拒绝" :value="2" />
      </el-select>
      <button class="ghost-btn" @click="load">查询</button>
      <button class="ghost-btn" @click="reset">重置</button>
    </div>

    <div class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="shopName" label="店铺名" min-width="140" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', statusClass(row.auditStatus)]">
              {{ statusText(row.auditStatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="auditRemark" label="审核备注" min-width="140">
          <template #default="{ row }">{{ row.auditRemark || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <template v-if="row.auditStatus === 0">
              <a class="action-link" @click="handleAudit(row, 1)">通过</a>
              <a class="action-link danger" @click="handleAudit(row, 2)">拒绝</a>
            </template>
            <span v-else class="action-disabled">—</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="pager">
        <el-pagination background layout="prev, pager, next"
          :total="total" :current-page="query.pageNum" :page-size="query.pageSize"
          @current-change="onPageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMerchants, auditMerchant } from '../../api/admin'

const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  auditStatus: null,
  keyword: '',
})

async function load() {
  loading.value = true
  try {
    const res = await listMerchants(query)
    const data = res.data || res
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function reset() {
  query.auditStatus = null
  query.keyword = ''
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

async function handleAudit(row, status) {
  let remark = ''
  if (status === 2) {
    try {
      const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝商家', {
        confirmButtonText: '确认拒绝',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：店铺信息不完整',
      })
      remark = value || ''
    } catch (e) { return }
  } else {
    try {
      await ElMessageBox.confirm(`确定通过商家「${row.shopName}」的入驻申请吗？`, '提示', { type: 'warning' })
    } catch (e) { return }
  }

  await auditMerchant(row.id, { status, remark })
  ElMessage.success(status === 1 ? '已通过' : '已拒绝')
  load()
}

function statusText(s) {
  return { 0: '待审核', 1: '已通过', 2: '已拒绝' }[s] || '未知'
}
function statusClass(s) {
  return { 0: 'pending', 1: 'on', 2: 'off' }[s] || ''
}


onMounted(load)
</script>

<style scoped>
.merchant-audit { max-width: 1200px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 26px; font-weight: 800; color: #000; margin-bottom: 6px; }
.page-header p { font-size: 13px; color: #999; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px; font-size: 13px; cursor: pointer;
}
.ghost-btn:hover { border-color: #000; color: #000; }
.table-card { background: #fff; border-radius: 12px; border: 1px solid #eee; padding: 4px; }
.status-tag { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.status-tag.pending { color: #faad14; background: rgba(250, 173, 20, 0.1); }
.status-tag.on { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.off { color: #ff4d4f; background: rgba(255, 77, 79, 0.08); }
.action-link { font-size: 13px; color: #00a8cc; cursor: pointer; margin-left: 16px; }
.action-link:hover { color: #00d4ff; }
.action-link.danger { color: #ff4d4f; }
.action-link.danger:hover { color: #ff7875; }
.action-disabled { color: #ccc; font-size: 13px; }
.pager { padding: 20px; display: flex; justify-content: flex-end; }
</style>