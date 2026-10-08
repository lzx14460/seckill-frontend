import request from './index'

export function listBanners() {
  return request.get('/api/banner/list')
}