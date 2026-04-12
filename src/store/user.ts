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

// 提取所有本地注册的用户
export const getUsers = () => {
  try {
    const usersStr = localStorage.getItem('demo_users')
    return usersStr ? JSON.parse(usersStr) : []
  } catch {
    return []
  }
}

// 注册新账号并存入 localStorage
export const registerUser = (account: string, pass: string) => {
  const users = getUsers()
  if (users.find((u: any) => u.account === account)) {
    throw new Error('抱歉，该账号已经被注册过了。')
  }
  users.push({ account, pass })
  localStorage.setItem('demo_users', JSON.stringify(users))
}
