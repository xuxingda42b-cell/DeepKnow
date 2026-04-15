<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="absolute top-6 left-6">
      <router-link to="/" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        <span class="font-medium">返回首页</span>
      </router-link>
    </div>

    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div class="p-8">
        <div class="text-center mb-8 flex flex-col items-center">
          <img src="/logo.svg" alt="DeepKnow Logo" class="w-20 h-20 object-contain drop-shadow-md mb-4 hover:scale-105 transition-transform duration-300" />
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
            注册 <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">DeepKnow</span>
          </h2>
          <p class="text-[12px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">知渊问答</p>
          <p class="text-gray-500 mt-3 text-sm">加入知渊问答，开启您的探索之旅</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名或邮箱</label>
            <input 
              v-model="account"
              type="text" 
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="请设置您的账号"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input 
              v-model="password"
              type="password" 
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="请设置密码"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <div v-if="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            class="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            注册并自动登录
          </button>
        </form>

        <div class="mt-8 relative flex items-center justify-center">
          <div class="absolute inset-x-0 h-px bg-gray-100"></div>
          <span class="relative bg-white px-4 text-sm text-gray-400">已有账号？</span>
        </div>

        <router-link to="/login" class="mt-6 flex justify-center w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2">
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, registerUser } from '../store/user'

const router = useRouter()
const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致！'
    return
  }
  if (account.value.length < 3) {
    errorMessage.value = '账号长度不能少于3个字符！'
    return
  }
  
  try {
    // 写入 localStorage
    registerUser(account.value, password.value)
    
    // 注册完成后自动登录
    login()
    router.push('/')
  } catch(error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}
</script>
