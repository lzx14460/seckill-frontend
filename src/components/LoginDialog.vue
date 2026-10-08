<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="440px"
    class="login-dialog"
    align-center
    :append-to-body="false"
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

      <!-- 身份选择 -->
      <div class="role-tabs">
        <div
          :class="['role-tab', role === 'USER' ? 'active' : '']"
          @click="role = 'USER'"
        >
          🛒 我要买东西
        </div>
        <div
          :class="['role-tab', role === 'MERCHANT' ? 'active' : '']"
          @click="role = 'MERCHANT'"
        >
          🏪 我要卖东西
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

        <!-- 注册时额外字段 -->
        <template v-if="mode === 'register'">
          <el-form-item>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.phone"
              placeholder="手机号"
              size="large"
              maxlength="11"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.email"
              placeholder="邮箱（可选）"
              size="large"
            />
          </el-form-item>

          <el-form-item v-if="role === 'MERCHANT'">
            <el-input
              v-model="form.shopName"
              placeholder="商铺名称（必填）"
              size="large"
            />
          </el-form-item>
        </template>

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
import { useRouter } from 'vue-router'
import { toast } from '../utils/toast'
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
const router = useRouter()
const mode = ref('login')
const role = ref('USER')

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  shopName: '',
})

const loading = ref(false)

const resetForm = () => {
  form.value = {
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    shopName: '',
  }
  mode.value = 'login'
  role.value = 'USER'
}

const handleSubmit = async () => {
  // 基础校验
  if (!form.value.username) {
    toast.warning('请输入用户名')
    return
  }
  if (!form.value.password) {
    toast.warning('请输入密码')
    return
  }

  if (mode.value === 'register') {
    if (form.value.password !== form.value.confirmPassword) {
      toast.warning('两次输入的密码不一致')
      return
    }
    if (form.value.password.length < 6) {
      toast.warning('密码长度不能少于6位')
      return
    }
    if (!form.value.phone) {
      toast.warning('请输入手机号')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
      toast.warning('手机号格式不正确')
      return
    }
    if (role.value === 'MERCHANT' && !form.value.shopName) {
      toast.warning('商家请填写商铺名称')
      return
    }
  }

  loading.value = true
  try {
    if (mode.value === 'login') {
      const res = await request.post('/user/login', {
        username: form.value.username,
        password: form.value.password,
        role: role.value,
      })
      if (res.code === 200) {
        userStore.setUser(res.data, form.value.username)
        sessionStorage.setItem('userId', res.data.userId)
        sessionStorage.setItem('role', res.data.role)
        sessionStorage.setItem('userName', res.data.userName)
        visible.value = false

        // ★ 只有商家跳后台，买家留首页
        if (res.data.role === 'MERCHANT') {
          router.push('/merchant/dashboard')
        }
        emit('success')
      } else {
        toast.error(res.message || '登录失败')
      }
    } else {
      const res = await request.post('/user/register', {
        username: form.value.username,
        password: form.value.password,
        role: role.value,
        phone: form.value.phone,
        email: form.value.email,
        shopName: form.value.shopName,
      })
      if (res.code === 200) {
        if (role.value === 'MERCHANT') {
          // 商家：不自动登录，提示等待审核
          toast.success('注册成功，已提交审核，请等待管理员通过')
          setTimeout(() => {
            visible.value = false
          }, 1500)
        } else {
          // 买家：自动登录
          toast.success('注册成功，正在登录...')
          const loginRes = await request.post('/user/login', {
            username: form.value.username,
            password: form.value.password,
            role: role.value,
          })
          if (loginRes.code === 200) {
            userStore.setUser(loginRes.data, form.value.username)
            sessionStorage.setItem('userId', loginRes.data.userId)
            sessionStorage.setItem('role', loginRes.data.role)
            sessionStorage.setItem('userName', loginRes.data.userName)
            visible.value = false
            emit('success')
          }
        }
      } else {
        toast.error(res.message || '注册失败')
      }
    }
  } catch (e) {
    toast.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 36px 40px 32px;
  position: relative;
  color: #fff;
}

.dialog-content::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
}

.close-btn {
  position: absolute;
  top: 16px; right: 20px;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}
.close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.dialog-header { margin-bottom: 20px; }

.brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 24px;
}

.brand-icon { font-size: 26px; }

.brand-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent !important;
}

.tabs {
  display: flex;
  align-items: flex-end;
  gap: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 12px;
}

.tab {
  font-size: 15px;
  color: #555;
  cursor: pointer;
  padding-bottom: 12px;
  margin-bottom: -13px;
  border-bottom: 2px solid transparent;
  transition: all 0.25s;
  letter-spacing: 1px;
}
.tab:hover { color: #aaa; }
.tab.active {
  color: #fff;
  font-weight: 600;
  border-bottom-color: #00d4ff;
}

/* 身份选择 */
.role-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.role-tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-size: 13px;
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.role-tab:hover {
  border-color: rgba(0, 212, 255, 0.4);
  color: #aaa;
}

.role-tab.active {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.08);
  color: #00d4ff;
  font-weight: 600;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.15);
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7) !important;
  border: none !important;
  border-radius: 8px !important;
  color: #fff !important;
  cursor: pointer;
  transition: all 0.3s;
}
.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.35);
  background: linear-gradient(90deg, #7b2ff7, #00d4ff) !important;
}

.dialog-footer {
  text-align: center;
  font-size: 13px;
  color: #555;
  margin-top: 20px;
}
.dialog-footer a {
  color: #00d4ff;
  cursor: pointer;
  margin-left: 4px;
}
.dialog-footer a:hover {
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}
</style>