import axios from 'axios'

const request = axios.create({
  baseURL: '',              // ★ 改成空，走 Vite proxy
  timeout: 10000,
  withCredentials: true     // 保留，proxy 也带 Cookie
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('请求失败', error)
    return Promise.reject(error)
  }
)

export default request