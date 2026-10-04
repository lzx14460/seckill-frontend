// 全局 Toast 调用工具
import { createApp, h } from 'vue'
import Toast from '../components/Toast.vue'

let toastInstance = null

const getInstance = () => {
  if (!toastInstance) {
    // 创建一个容器
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 挂载 Toast 组件
    const app = createApp({
      render() {
        return h(Toast, {
          ref: (el) => {
            if (el) toastInstance = el
          }
        })
      }
    })
    app.mount(container)
  }
  return toastInstance
}

export const toast = {
  success(title, desc) {
    getInstance()?.add({ type: 'success', title, desc })
  },
  error(title, desc) {
    getInstance()?.add({ type: 'error', title, desc })
  },
  warning(title, desc) {
    getInstance()?.add({ type: 'warning', title, desc })
  },
  info(title, desc) {
    getInstance()?.add({ type: 'info', title, desc })
  }
}