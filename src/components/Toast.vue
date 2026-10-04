<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="item in toasts"
        :key="item.id"
        :class="['toast-item', `toast-${item.type}`]"
      >
        <!-- 左侧图标 -->
        <div class="toast-icon">
          <span v-if="item.type === 'success'">✓</span>
          <span v-else-if="item.type === 'error'">✕</span>
          <span v-else-if="item.type === 'warning'">!</span>
          <span v-else>i</span>
        </div>

        <!-- 内容 -->
        <div class="toast-content">
          <div class="toast-title">{{ item.title }}</div>
          <div v-if="item.desc" class="toast-desc">{{ item.desc }}</div>
        </div>

        <!-- 关闭 -->
        <div class="toast-close" @click="remove(item.id)">×</div>

        <!-- 底部进度条 -->
        <div
          class="toast-progress"
          :style="{ animationDuration: item.duration + 'ms' }"
        ></div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let seed = 0

const add = (options) => {
  const id = ++seed
  const toast = {
    id,
    type: options.type || 'info',
    title: options.title || '提示',
    desc: options.desc || '',
    duration: options.duration || 2500
  }
  toasts.value.push(toast)

  // 播放音效
  if (options.sound !== false) {
    playSound(toast.type)
  }

  // 自动移除
  setTimeout(() => remove(id), toast.duration)
  return id
}

const remove = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) toasts.value.splice(index, 1)
}

// 用 Web Audio API 生成简单音效，不需要音频文件
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    // 根据类型设置不同音调
    const freq = type === 'success' ? 880 : type === 'error' ? 220 : 660
    osc.frequency.value = freq
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch (e) {
    // 浏览器不支持时静默失败
  }
}

// 暴露方法给外部
defineExpose({ add, remove })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 300px;
  max-width: 420px;
  padding: 16px 20px 18px;
  background: #0a0a15;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  pointer-events: auto;
  backdrop-filter: blur(20px);
}

/* 不同类型不同光晕 */
.toast-success {
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(0, 212, 255, 0.1),
              inset 0 0 40px rgba(0, 212, 255, 0.05);
}

.toast-error {
  border-color: rgba(255, 75, 110, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(255, 75, 110, 0.1),
              inset 0 0 40px rgba(255, 75, 110, 0.05);
}

.toast-warning {
  border-color: rgba(255, 193, 7, 0.3);
}

.toast-info {
  border-color: rgba(123, 47, 247, 0.3);
}

/* 图标 */
.toast-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
}

.toast-success .toast-icon {
  background: linear-gradient(135deg, #00d4ff, #7b2ff7);
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.toast-error .toast-icon {
  background: linear-gradient(135deg, #ff4b6e, #ff2d55);
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 75, 110, 0.5);
}

.toast-warning .toast-icon {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #000;
}

.toast-info .toast-icon {
  background: linear-gradient(135deg, #7b2ff7, #00d4ff);
  color: #fff;
}

/* 内容 */
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.toast-desc {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

/* 关闭 */
.toast-close {
  font-size: 18px;
  color: #444;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #fff;
}

/* 底部进度条 */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, #00d4ff, #7b2ff7);
  transform-origin: left;
  animation: progress linear;
}

.toast-error .toast-progress {
  background: linear-gradient(90deg, #ff4b6e, #ff2d55);
}

@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* 过渡动画 */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>