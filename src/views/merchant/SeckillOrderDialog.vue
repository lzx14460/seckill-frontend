<template>
  <el-dialog
    v-model="visible"
    title="秒杀订单"
    width="800px"
    align-center
    :append-to-body="false"
    class="order-dialog"
  >
    <div v-if="activity" class="order-content">
      <div class="order-header">
        <span>活动：<strong>{{ activity.name }}</strong></span>
        <span class="order-total">共 {{ total }} 单</span>
      </div>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column prop="orderNo" label="订单号" min-width="200" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty">
        <p>暂无订单</p>
      </div>

      <div v-if="total > 0" class="pager">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :current-page="pageNum"
          :page-size="pageSize"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { listSeckillOrders } from '../../api/merchant'

const props = defineProps({
  modelValue: Boolean,
  activity: Object,
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

async function load() {
  if (!props.activity) return
  loading.value = true
  try {
    const res = await listSeckillOrders(props.activity.id, {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    const data = res.data || res
    list.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function onPageChange(p) {
  pageNum.value = p
  load()
}

function formatTime(t) {
  if (!t) return '—'
  return t.replace('T', ' ').substring(0, 19)
}

watch(visible, (v) => {
  if (v) {
    pageNum.value = 1
    load()
  }
})
</script>

<style scoped>
.order-content { padding: 4px 0; }

.order-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 0 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}
.order-header strong { color: #000; }
.order-total { font-size: 13px; color: #999; }

.empty {
  padding: 40px; text-align: center; color: #999;
}

.pager { padding: 16px 0; display: flex; justify-content: flex-end; }

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #000; color: #fff;
}
</style>