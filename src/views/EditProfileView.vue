<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 头部标识 -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h1 class="text-xl font-bold text-gray-900">编辑个人资料</h1>
        <router-link to="/profile" class="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          返回主页
        </router-link>
      </div>

      <!-- 表单区域 -->
      <div class="px-8 py-6">
        <form @submit.prevent="handleSave" class="space-y-6">
          
          <!-- 头像上传区 -->
          <div class="flex items-center gap-6 pb-6 border-b border-gray-50">
            <div class="relative group cursor-pointer" @click="triggerFileInput">
              <input type="file" ref="fileInputRef" accept="image/*" class="hidden" @change="handleFileChange" />
              <img 
                :src="formData.avatarUrl" 
                alt="User Avatar" 
                class="w-20 h-20 rounded-full border border-gray-200 bg-gray-50 object-cover group-hover:opacity-80 transition-opacity"
              />
              <button type="button" class="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 text-white shadow-sm hover:bg-blue-700 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">上传新头像</p>
              <p class="text-xs text-gray-400 mt-1">支持 JPG, GIF 或 PNG 格式，最大不超过 2MB。</p>
            </div>
          </div>

          <!-- 基础信息与详细信息双栏布局 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            
            <div class="col-span-1 sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">一句话简介</label>
              <input v-model="formData.bio" type="text" placeholder="简单介绍一下你自己..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">性别</label>
              <select v-model="formData.gender" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm">
                <option value="none">保密</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">生日</label>
              <input v-model="formData.birthday" type="date" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>

            <div class="col-span-1 sm:col-span-2 pt-2 pb-1">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">联系方式</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
              <input v-model="formData.phone" type="tel" placeholder="您的手机号码" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
              <input v-model="formData.email" type="email" placeholder="example@email.com" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>
            
            <div class="col-span-1 sm:col-span-2 pt-2 pb-1">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">教育与社交</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最高学历</label>
              <select v-model="formData.education" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm">
                <option value="">请选择...</option>
                <option value="highschool">高中及以下</option>
                <option value="associate">大专</option>
                <option value="bachelor">本科</option>
                <option value="master">硕士</option>
                <option value="doctor">博士</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">毕业院校</label>
              <input v-model="formData.school" type="text" placeholder="您就读的学校" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">专业</label>
              <input v-model="formData.major" type="text" placeholder="主修专业" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">GitHub 主页</label>
              <input v-model="formData.github" type="url" placeholder="https://github.com/..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-sm" />
            </div>

          </div>

          <!-- 底部按钮区 -->
          <div class="pt-6 flex justify-end gap-3 mt-8">
            <router-link to="/profile" class="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white">
              取消
            </router-link>
            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95">
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = reactive({
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  bio: '',
  gender: 'none',
  birthday: '',
  phone: '',
  email: '',
  education: '',
  school: '',
  major: '',
  github: ''
})

const fileInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  const savedData = localStorage.getItem('profile_data')
  if (savedData) {
    try {
      Object.assign(formData, JSON.parse(savedData))
    } catch (e) {
      console.error('Failed to parse profile data', e)
    }
  }
})

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('头像文件大小不能超过 2MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.avatarUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSave = () => {
  // 保存动作
  localStorage.setItem('profile_data', JSON.stringify(formData))
  alert('资料更新成功！')
  router.push('/profile')
}
</script>
