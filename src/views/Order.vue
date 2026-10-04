<template>
  <div class="order-page">
    <header class="header">
      <div class="header-content">
        <div class="logo">⚡ 秒杀商城</div>
        <div class="nav">
          <router-link to="/home" class="nav-item">秒杀</router-link>
          <router-link to="/order" class="nav-item active">我的订单</router-link>
        </div>
      </div>
    </header>

    <div class="content">
      <h2 class="title">我的秒杀订单</h2>
      <el-table :data="orderList" style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="220" />
        <el-table-column prop="goodsId" label="商品ID" width="100" />
        <el-table-column prop="createTime" label="下单时间" />
        <el-table-column label="状态" width="120">
          <template #default>
            <el-tag type="success">已支付</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../api'

const orderList = ref([])
const loading = ref(false)

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await request.get('/seckill/order/list')
    if (res.code === 200) {
      orderList.value = res.data || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #ff4b2b;
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-item {
  color: #666;
  text-decoration: none;
  font-size: 16px;
}

.nav-item.active {
  color: #ff4b2b;
  font-weight: 500;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
}
</style>