<template>
  <div class="user-manage">
    <div class="page-header">
      <div>
        <h2>用户管理</h2>
        <p>管理平台买家账号</p>
      </div>
    </div>

    <div class="filter-bar">
      <el-input v-model="query.keyword" placeholder="用户名" clearable style="width: 220px" @keyup.enter="load" />
      <el-select v-model="query.banned" placeholder="全部状态" clearable style="width: 140px">
        <el-option label="正常" :value="0" />
        <el-option label="已封禁" :value="1" />
      </el-select>
      <button class="ghost-btn" @click="load">查询</button>
      <button class="ghost-btn" @click="reset">重置</button>
    </div>

    <div class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">{{ row.phone || '—' }}</template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">{{ row.email || '—' }}</template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', row.banned === 1 ? 'banned' : 'on']">
              {{ row.banned === 1 ? '已封禁' : '正常' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="right">
          <template #default="{ row }">
            <a
              v-if="row.banned !== 1"
              class="action-link danger"
              @click="handleBan(row, 1)"
            >
              封禁
            </a>
            <a
              v-else
              class="action-link"
              @click="handleBan(row, 0)"
            >
              解封
            </a>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty">
        <div class="empty-icon">👥</div>
        <p>暂无用户</p>
      </div>

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
import { listAdminUsers, banUser } from '../../api/admin'

const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  banned: null,
  keyword: '',
})

async function load() {
  loading.value = true
  try {
    const res = await listAdminUsers(query)
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
  query.banned = null
  query.keyword = ''
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

async function handleBan(row, banned) {
  const text = banned === 1 ? '封禁' : '解封'
  try {
    await ElMessageBox.confirm(`确定要${text}用户「${row.username}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: `确认${text}`,
      cancelButtonText: '取消',
    })
  } catch (e) { return }

  await banUser(row.id, banned)
  ElMessage.success(`${text}成功`)
  load()
}

function formatTime(t) {
  if (!t) return '—'
  return t.replace('T', ' ').substring(0, 19)
}

onMounted(load)
</script>

<style scoped>
.user-manage { max-width: 1200px; }
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
.status-tag.on { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.banned { color: #ff4d4f; background: rgba(255, 77, 79, 0.08); }

.action-link { font-size: 13px; color: #00a8cc; cursor: pointer; }
.action-link:hover { color: #00d4ff; }
.action-link.danger { color: #ff4d4f; }
.action-link.danger:hover { color: #ff7875; }

.empty { padding: 60px 20px; text-align: center; color: #999; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

.pager { padding: 20px; display: flex; justify-content: flex-end; }
</style>