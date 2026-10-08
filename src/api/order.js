import request from './index'

// 我的订单
export function listMyOrders(params) {
  return request.get('/api/user/order/list', { params })
}

// 取消订单
export function cancelMyOrder(orderId) {
  return request.put(`/api/user/order/${orderId}/cancel`)
}

// 订单统计
export function getMyOrderStats() {
  return request.get('/api/user/order/stats')
}