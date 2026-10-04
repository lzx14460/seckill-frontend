import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  withCredentials: true   // 关键：带上 Session Cookie
})

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('请求失败', error)
    return Promise.reject(error)
  }
)

export default request