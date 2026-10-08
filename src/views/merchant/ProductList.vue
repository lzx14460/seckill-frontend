<template>
  <div class="product-list">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>商品管理</h2>
        <p>管理你的商品，上架 / 下架 / 编辑 / 删除</p>
      </div>
      <button class="primary-btn" @click="$router.push('/merchant/products/edit')">
        + 新增商品
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="query.title"
        placeholder="搜索商品标题"
        clearable
        class="dark-input"
        style="width: 240px"
        @keyup.enter="load"
      />
      <el-select
        v-model="query.status"
        placeholder="全部状态"
        clearable
        class="dark-input"
        style="width: 140px"
      >
        <el-option label="上架中" :value="1" />
        <el-option label="已下架" :value="0" />
      </el-select>
      <el-select
        v-model="query.category"
        placeholder="全部类型"
        clearable
        class="dark-input"
        style="width: 140px"
      >
        <el-option
          v-for="c in ['数码', '家电', '服饰', '美妆', '食品', '其他']"
          :key="c"
          :label="c"
          :value="c"
        />
      </el-select>
      <button class="ghost-btn" @click="load">查询</button>
      <button class="ghost-btn" @click="reset">重置</button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table
        :data="list"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="headerStyle"
        :cell-style="cellStyle"
      >
        <el-table-column label="商品" min-width="280">
          <template #default="{ row }">
            <div class="goods-cell">
              <el-image :src="row.coverImg" fit="cover" class="goods-cover">
                <template #error>
                  <div class="cover-placeholder">无图</div>
                </template>
              </el-image>
              <div class="goods-meta">
                <div class="goods-name">{{ row.title }}</div>
                <div class="goods-sub">{{ row.subTitle || '—' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <span class="category-tag">{{ row.category || '其他' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <span class="price-now">¥{{ row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column label="库存" width="100">
          <template #default="{ row }">
            <span class="stock-text">{{ row.stock }} 件</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', row.status === 1 ? 'on' : 'off']">
              {{ row.status === 1 ? '上架中' : '已下架' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" align="right">
          <template #default="{ row }">
            <a class="action-link" @click="edit(row)">编辑</a>
            <a class="action-link" @click="toggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </a>
            <a class="action-link" @click="viewStats(row)">数据</a>
            <a class="action-link danger" @click="handleDelete(row)">删除</a>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty">
        <div class="empty-icon">📦</div>
        <p>还没有商品，点击右上角「新增商品」开始吧</p>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listProducts, updateProductStatus, deleteProduct } from '../../api/merchant'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  status: null,
  category: null,
})

const headerStyle = {
  background: '#fafafa',
  color: '#666',
  fontWeight: '600',
  fontSize: '13px',
  letterSpacing: '0.5px',
}
const cellStyle = { padding: '16px 0' }

async function load() {
  loading.value = true
  try {
    const res = await listProducts(query)
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
  query.title = ''
  query.status = null
  query.category = null
  query.pageNum = 1
  load()
}

function onPageChange(p) {
  query.pageNum = p
  load()
}

function edit(row) {
  router.push(`/merchant/products/edit/${row.id}`)
}

function viewStats(row) {
  router.push(`/merchant/products/stats/${row.id}`)
}

async function toggleStatus(row) {
  const next = row.status === 1 ? 0 : 1
  const text = next === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${text}「${row.title}」吗？`, '提示', { type: 'warning' })
  } catch (e) { return }
  await updateProductStatus(row.id, next)
  ElMessage.success(`${text}成功`)
  load()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.title}」吗？此操作不可恢复`,
      '警告',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
  } catch (e) { return }

  try {
    await deleteProduct(row.id)
    ElMessage.success('已删除')
    if (list.value.length === 1 && query.pageNum > 1) {
      query.pageNum--
    }
    load()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

onMounted(load)
</script>

<style scoped>
/* 你原有的样式 + 加 .category-tag */
.product-list { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
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

.primary-btn {
  padding: 10px 22px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.25s;
}

.primary-btn:hover {
  background: #1a1a1a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.ghost-btn {
  padding: 9px 18px;
  background: #fff;
  color: #333;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.ghost-btn:hover {
  border-color: #000;
  color: #000;
}

:deep(.dark-input .el-input__wrapper) {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  box-shadow: none;
  transition: all 0.2s;
}

:deep(.dark-input .el-input__wrapper:hover) {
  border-color: #bbb;
}

:deep(.dark-input .el-input__wrapper.is-focus) {
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 4px;
  overflow: hidden;
}

:deep(.el-table) {
  background: transparent;
  font-size: 14px;
  --el-table-border-color: #f0f0f0;
  --el-table-row-hover-bg-color: #fafafa;
}

:deep(.el-table tr) { transition: background 0.15s; }

.goods-cell { display: flex; align-items: center; gap: 12px; }

.goods-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.cover-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #bbb; font-size: 11px;
}

.goods-meta { min-width: 0; }

.goods-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-sub {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-tag {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.price-now {
  font-size: 15px;
  font-weight: 700;
  color: #000;
}

.stock-text {
  font-size: 14px;
  color: #333;
}

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status-tag.on {
  color: #00a854;
  background: rgba(0, 168, 84, 0.08);
  border: 1px solid rgba(0, 168, 84, 0.2);
}

.status-tag.off {
  color: #888;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
}

.action-link {
  font-size: 13px;
  color: #00a8cc;
  cursor: pointer;
  margin-left: 16px;
  transition: all 0.2s;
}

.action-link:hover {
  color: #00d4ff;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.action-link.danger { color: #ff4d4f; }
.action-link.danger:hover { color: #ff7875; }

.empty {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty p { font-size: 14px; }

.pager {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #000;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #000;
}
</style>