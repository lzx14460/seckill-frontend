import { ElMessage } from 'element-plus'

// 统一的提示风格
export const showMessage = (text, type = 'info') => {
  ElMessage({
    message: text,
    type,
    duration: 2000,
    customClass: 'custom-message'
  })
}

export const showSuccess = (text) => showMessage(text, 'success')
export const showError = (text) => showMessage(text, 'error')
export const showWarning = (text) => showMessage(text, 'warning')