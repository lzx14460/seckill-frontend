import request from './index'

// 商家列表
export function listMerchants(params) {
  return request.get('/api/admin/merchant/list', { params })
}

// 审核商家
export function auditMerchant(id, data) {
  return request.put(`/api/admin/merchant/${id}/audit`, data)
}
// 商品
export function listAdminProducts(params) {
  return request.get('/api/admin/product/list', { params })
}
export function auditProduct(id, data) {
  return request.put(`/api/admin/product/${id}/audit`, data)
}
export function forceOffProduct(id) {
  return request.put(`/api/admin/product/${id}/force-off`)
}

// 用户
export function listAdminUsers(params) {
  return request.get('/api/admin/user/list', { params })
}
export function banUser(id, banned) {
  return request.put(`/api/admin/user/${id}/ban?banned=${banned}`)
}
// 轮播图
export function listBanners(params) {
  return request.get('/api/admin/banner/list', { params })
}
export function saveBanner(data) {
  return request.post('/api/admin/banner', data)
}
export function deleteBanner(id) {
  return request.delete(`/api/admin/banner/${id}`)
}
// 操作日志
export function listOperationLogs(params) {
  return request.get('/api/admin/log/list', { params })
}