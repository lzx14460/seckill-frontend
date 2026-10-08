import request from './index'

// 商品列表（分页）
export function listProducts(params) {
  return request.get('/api/merchant/product/list', { params })
}

// 商品详情
export function getProduct(id) {
  return request.get(`/api/merchant/product/${id}`)
}

// 新增/编辑（有 id 就是编辑）
export function saveProduct(data) {
  return request.post('/api/merchant/product', data)
}

// 上下架
export function updateProductStatus(id, status) {
  return request.put(`/api/merchant/product/${id}/status`, null, {
    params: { status }
  })
}

// 删除（软删）              ← 新增
export function deleteProduct(id) {
  return request.delete(`/api/merchant/product/${id}`)
}


// 秒杀活动列表（你现有商品列表之外）
export function listSeckillActivities(params) {
  return request.get('/api/merchant/seckill/list', { params })
}

// 补货
export function addSeckillStock(activityId, count) {
  return request.post(`/api/merchant/seckill/${activityId}/stock`, null, {
    params: { count }
  })
}

// 活动订单
export function listSeckillOrders(activityId, params) {
  return request.get(`/api/merchant/seckill/${activityId}/orders`, { params })
}
// 保存秒杀活动
export function saveSeckillActivity(data) {
  return request.post('/api/merchant/seckill', data)
}

// 活动详情
export function getSeckillActivity(id) {
  return request.get(`/api/merchant/seckill/${id}`)
}
// 取消活动
export function cancelSeckillActivity(id) {
  return request.delete(`/api/merchant/seckill/${id}`)
}
// Dashboard 统计
export function getDashboardStats() {
  return request.get('/api/merchant/dashboard/stats')
}
// 商品数据统计
export function getProductStats(productId) {
  return request.get(`/api/merchant/product/${productId}/stats`)
}
// 商家订单列表
export function listMerchantOrders(params) {
  return request.get('/api/merchant/order/list', { params })
}

// 改订单状态
export function updateOrderStatus(orderId, status) {
  return request.put(`/api/merchant/order/${orderId}/status`, null, {
    params: { status }
  })
}