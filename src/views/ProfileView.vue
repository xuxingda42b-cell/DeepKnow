<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 头图背景 -->
      <div class="h-32 bg-gradient-to-r from-blue-500 to-blue-400"></div>
      
      <!-- 用户信息区 -->
      <div class="px-8 pb-8 relative">
        <div class="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-16 mb-6 gap-4">
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <img 
              :src="profileData.avatarUrl" 
              alt="User Avatar" 
              class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md bg-gray-50 object-cover"
            />
            <div class="text-center sm:text-left mb-2">
              <h1 class="text-2xl font-bold text-gray-900">{{ profileData.name || '管理员' }}</h1>
              <p class="text-gray-500 text-sm mt-1">{{ profileData.bio || '这个人很懒，什么都没有留下。' }}</p>
            </div>
          </div>
          
          <router-link to="/profile/edit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-sm text-sm inline-block">
            编辑资料
          </router-link>
        </div>

        <!-- 统计数据 -->
        <div class="flex justify-center sm:justify-start gap-6 sm:gap-8 py-4 border-y border-gray-100 mb-8 flex-wrap">
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">42</div>
            <div class="text-xs text-gray-500 mt-1">提问</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">128</div>
            <div class="text-xs text-gray-500 mt-1">回答</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">1k+</div>
            <div class="text-xs text-gray-500 mt-1">获赞</div>
          </div>
          <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
            <div class="text-xl font-bold text-gray-900">256</div>
            <div class="text-xs text-gray-500 mt-1">关注</div>
          </div>
          <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
            <div class="text-xl font-bold text-gray-900">12.5k</div>
            <div class="text-xs text-gray-500 mt-1">粉丝</div>
          </div>
        </div>

        <!-- 标签页与内容 -->
        <div>
          <div class="flex gap-6 border-b border-gray-100">
            <button 
              @click="activeTab = 'profile'"
              :class="['pb-3 font-medium text-sm transition-colors', activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              个人资料
            </button>
            <button 
              @click="activeTab = 'recent'"
              :class="['pb-3 font-medium text-sm transition-colors', activeTab === 'recent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              最近动态
            </button>
            <button 
              @click="activeTab = 'questions'"
              :class="['pb-3 font-medium text-sm transition-colors', activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              我的提问
            </button>
            <button 
              @click="activeTab = 'answers'"
              :class="['pb-3 font-medium text-sm transition-colors', activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              我的回答
            </button>
          </div>
          
          <!-- 个人资料面板 -->
          <div v-show="activeTab === 'profile'" class="py-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div class="space-y-4">
                <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">基本信息</h3>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">性别：</span><span class="text-gray-900">{{ genderMap[profileData.gender] || '保密' }}</span></div>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">生日：</span><span class="text-gray-900">{{ profileData.birthday || '-' }}</span></div>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">手机号：</span><span class="text-gray-900">{{ profileData.phone || '-' }}</span></div>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">邮箱：</span><span class="text-gray-900">{{ profileData.email || '-' }}</span></div>
              </div>
              <div class="space-y-4">
                <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">教育与社交</h3>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">最高学历：</span><span class="text-gray-900">{{ educationMap[profileData.education] || '-' }}</span></div>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">毕业院校：</span><span class="text-gray-900">{{ profileData.school || '-' }}</span></div>
                <div class="text-sm flex"><span class="text-gray-500 w-24 shrink-0">专业：</span><span class="text-gray-900">{{ profileData.major || '-' }}</span></div>
                <div class="text-sm flex items-center">
                  <span class="text-gray-500 w-24 shrink-0">GitHub：</span>
                  <a v-if="profileData.github" :href="profileData.github" target="_blank" class="text-blue-600 hover:underline hover:text-blue-800 break-all">{{ profileData.github }}</a>
                  <span v-else class="text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab !== 'profile'" class="py-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center">
            <svg class="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            暂无动态数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const activeTab = ref('profile')

const profileData = reactive({
  name: '管理员',
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

const genderMap: Record<string, string> = {
  none: '保密',
  male: '男',
  female: '女'
}

const educationMap: Record<string, string> = {
  highschool: '高中及以下',
  associate: '大专',
  bachelor: '本科',
  master: '硕士',
  doctor: '博士'
}

onMounted(() => {
  const savedData = localStorage.getItem('profile_data')
  if (savedData) {
    try {
      Object.assign(profileData, JSON.parse(savedData))
    } catch (e) {
      console.error('Failed to parse profile data', e)
    }
  }
})
</script>
