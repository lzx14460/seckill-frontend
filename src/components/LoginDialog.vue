<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="420px"
    class="login-dialog"
    align-center
    @closed="resetForm"
  >
    <div class="dialog-content">
      <!-- 关闭按钮 -->
      <div class="close-btn" @click="visible = false">✕</div>

      <!-- 标题切换 -->
      <div class="dialog-header">
        <div class="brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">Seckill</span>
        </div>
        <div class="tabs">
          <div
            :class="['tab', mode === 'login' ? 'active' : '']"
            @click="mode = 'login'"
          >
            登录
          </div>
          <div
            :class="['tab', mode === 'register' ? 'active' : '']"
            @click="mode = 'register'"
          >
            注册
          </div>
        </div>
      </div>

      <!-- 表单 -->
      <el-form :model="form" class="dialog-form" @keyup.enter="handleSubmit">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item v-if="mode === 'register'">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            show-password
          />
        </el-form-item>

        <el-button
          class="submit-btn"
          size="large"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ mode === 'login' ? '登 录' : '注 册' }}
        </el-button>
      </el-form>

      <div class="dialog-footer">
        <span v-if="mode === 'login'">
          还没有账号？
          <a @click="mode = 'register'">立即注册</a>
        </span>
        <span v-else>
          已有账号？
          <a @click="mode = 'login'">立即登录</a>
        </span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api'
import { useUserStore } from '../store/user'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const userStore = useUserStore()
const mode = ref('login')
const form = ref({ username: '', password: '', confirmPassword: '' })
const loading = ref(false)

const resetForm = () => {
  form.value = { username: '', password: '', confirmPassword: '' }
  mode.value = 'login'
}

const handleSubmit = async () => {
  if (!form.value.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }

  if (mode.value === 'register') {
    if (form.value.password !== form.value.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致')
      return
    }
    if (form.value.password.length < 6) {
      ElMessage.warning('密码长度不能少于6位')
      return
    }
  }

  loading.value = true
  try {
    if (mode.value === 'login') {
      const res = await request.post('/user/login', {
        username: form.value.username,
        password: form.value.password
      })
      if (res.code === 200) {
        ElMessage.success('登录成功')
        userStore.setUser(res.data, form.value.username)
        visible.value = false
        emit('success')
      } else {
        ElMessage.error(res.message || '登录失败')
      }
    } else {
      const res = await request.post('/user/register', {
        username: form.value.username,
        password: form.value.password
      })
      if (res.code === 200) {
        ElMessage.success('注册成功，正在登录...')
        // 注册成功后自动登录
        const loginRes = await request.post('/user/login', {
          username: form.value.username,
          password: form.value.password
        })
        if (loginRes.code === 200) {
          userStore.setUser(loginRes.data, form.value.username)
          visible.value = false
          emit('success')
        }
      } else {
        ElMessage.error(res.message || '注册失败')
      }
    }
  } catch (e) {
    ElMessage.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.el-dialog) {
  background: #1a1a2e;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

:deep(.el-dialog__header) {
  display: none;
}

:deep(.el-dialog__body) {
  padding: 0;
}

.dialog-content {
  padding: 32px 36px 28px;
  position: relative;
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #fff;
}

.dialog-header {
  margin-bottom: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.brand-icon {
  font-size: 24px;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
}

.tab {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding-bottom: 12px;
  margin-bottom: -13px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #00d4ff;
  border-bottom-color: #00d4ff;
  font-weight: 500;
}

.dialog-form {
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 212, 255, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.15);
}

:deep(.el-input__inner) {
  color: #fff;
  height: 44px;
}

:deep(.el-input__inner::placeholder) {
  color: #555;
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  font-size: 16px;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
}

.submit-btn:hover {
  background: linear-gradient(90deg, #7b2ff7, #00d4ff);
  box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);
}

.dialog-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 16px;
}

.dialog-footer a {
  color: #00d4ff;
  cursor: pointer;
  margin-left: 4px;
}

.dialog-footer a:hover {
  text-decoration: underline;
}
</style>