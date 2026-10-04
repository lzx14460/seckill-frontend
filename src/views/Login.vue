<template>
  <div class="login-page">
    <div class="login-box">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <h1>秒杀商城</h1>
        <p>限时抢购 · 惊喜不断</p>
      </div>

      <el-form :model="form" class="login-form" @keyup.enter="handleLogin">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-button
          type="danger"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>

      <div class="tips">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from '../api'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  if (!form.value.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const res = await request.post('/user/login', form.value)
    if (res.code === 200) {
      ElMessage.success('登录成功，欢迎回来')
      localStorage.setItem('userId', res.data)
      router.push('/home')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (e) {
    ElMessage.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-page::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  top: -200px;
  right: -200px;
}

.login-page::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  bottom: -150px;
  left: -150px;
}

.login-box {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.logo h1 {
  font-size: 28px;
  color: #ff4b2b;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.logo p {
  font-size: 14px;
  color: #999;
}

.login-form {
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  letter-spacing: 8px;
  background: linear-gradient(90deg, #ff416c, #ff4b2b);
  border: none;
  border-radius: 8px;
}

.login-btn:hover {
  background: linear-gradient(90deg, #ff4b2b, #ff416c);
}

.tips {
  text-align: center;
  font-size: 14px;
  color: #999;
}

.tips a {
  color: #ff4b2b;
  text-decoration: none;
  font-weight: 500;
}

.tips a:hover {
  text-decoration: underline;
}
</style>