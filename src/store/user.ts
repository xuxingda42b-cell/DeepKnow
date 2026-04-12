import { ref } from 'vue'

// 从 localStorage 初始化持久化状态
export const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')

export const login = () => {
  isLoggedIn.value = true
  localStorage.setItem('isLoggedIn', 'true')
}

export const logout = () => {
  isLoggedIn.value = false
  localStorage.removeItem('isLoggedIn')
}
