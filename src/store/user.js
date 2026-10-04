import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userId = ref(localStorage.getItem('userId') || null)
  const username = ref(localStorage.getItem('username') || '')

  const setUser = (id, name) => {
    userId.value = id
    username.value = name
    localStorage.setItem('userId', id)
    localStorage.setItem('username', name)
  }

  const clearUser = () => {
    userId.value = null
    username.value = ''
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
  }

  const isLogin = () => !!userId.value

  return { userId, username, setUser, clearUser, isLogin }
})