<template>
  <div class="admin-login-page">
    <div class="bg-grid"></div>
    <div class="login-box">
      <div class="brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-name">闪购 · 管理后台</span>
      </div>
      <p class="subtitle">ADMIN CONSOLE</p>

      <el-form :model="form" @keyup.enter="handleLogin">
        <el-input
          v-model="form.username"
          placeholder="管理员账号"
          size="large"
          prefix-icon="User"
        />
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          size="large"
          show-password
          prefix-icon="Lock"
          style="margin-top: 16px"
        />

        <button
          class="submit-btn"
          :disabled="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </el-form>

      <div class="footer">
        <a @click="$router.push('/home')">← 返回用户首页</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../../api'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    const res = await request.post('/user/admin/login', {
      username: form.value.username,
      password: form.value.password,
    })
    if (res.code === 200) {
      sessionStorage.setItem('userId', res.data.userId)
      sessionStorage.setItem('role', res.data.role)
      sessionStorage.setItem('userName', res.data.userName)
      ElMessage.success('登录成功')
      router.push('/admin/merchant-audit')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (e) {
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
}

.login-box {
  position: relative;
  z-index: 1;
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.login-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  border-radius: 16px 16px 0 0;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.brand-icon { font-size: 28px; }

.brand-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  font-size: 11px;
  color: #666;
  letter-spacing: 3px;
  margin-bottom: 36px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: none !important;
  padding: 0 14px;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00d4ff !important;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.12) !important;
}

:deep(.el-input__inner) {
  color: #fff !important;
  height: 44px;
  background: transparent !important;
}

:deep(.el-input__inner::placeholder) {
  color: #4a4a4a !important;
}

:deep(.el-input__prefix),
:deep(.el-input__suffix) {
  color: #555 !important;
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 24px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.35);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
}

.footer a {
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.footer a:hover { color: #00d4ff; }
</style>