<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px] max-h-[80vh]">
      
      <!-- 左侧边栏导航 -->
      <aside class="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 shrink-0 flex flex-col">
        <h2 class="text-xl font-bold text-gray-900 mb-6">我的消息</h2>
        <nav class="space-y-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all outline-none"
            :class="activeTab === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'"
          >
            <div class="flex items-center gap-3">
              <span v-html="tab.icon" class="w-5 h-5 flex items-center justify-center opacity-90"></span>
              <span>{{ tab.name }}</span>
            </div>
            <span v-if="tab.unread" class="inline-flex items-center justify-center px-1.5 min-w-[20px] h-5 py-0.5 text-[11px] font-bold rounded-full transition-colors" :class="activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'">
              {{ tab.unread }}
            </span>
          </button>
        </nav>
      </aside>

      <!-- 右侧消息列表区 -->
      <div class="flex-1 flex flex-col relative bg-white">
        <!-- 头部栏 -->
        <div class="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0">
          <h3 class="font-bold text-gray-800 text-lg">{{ currentTabName }}</h3>
          <button class="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            全部标为已读
          </button>
        </div>

        <!-- 消息内容 -->
        <div class="flex-1 overflow-y-auto w-full">
          <!-- 消息为空占位 -->
          <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 py-16">
            <svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <p class="text-sm">暂时没有新消息</p>
          </div>
          
          <!-- 消息列表 -->
          <ul v-else class="divide-y divide-gray-50/80">
            <li v-for="msg in messages" :key="msg.id" class="px-8 py-5 hover:bg-blue-50/30 transition-colors cursor-pointer group relative">
              <div v-if="!msg.isRead" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div class="flex gap-4 items-start">
                <img :src="msg.avatar" alt="Avatar" class="w-11 h-11 rounded-full border border-gray-100 object-cover shrink-0 mt-0.5" />
                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1.5">
                    <p class="text-[15px] font-medium text-gray-900 truncate">
                      <span class="hover:text-blue-600 transition-colors">{{ msg.sender }}</span>
                      <span class="text-gray-500 font-normal ml-1.5 text-sm">{{ msg.action }}</span>
                    </p>
                    <time class="text-xs text-gray-400 shrink-0">{{ msg.time }}</time>
                  </div>
                  <p v-if="msg.content" class="text-sm text-gray-700 line-clamp-2 leading-relaxed bg-white/50 backdrop-blur-sm rounded-lg py-1">{{ msg.content }}</p>
                  <div v-if="msg.target" class="mt-3 text-sm bg-gray-50/80 border border-gray-100 rounded-lg p-3.5 text-gray-500 truncate group-hover:border-blue-100/80 group-hover:bg-blue-50/50 transition-colors leading-snug">
                    <span class="font-medium text-gray-600 mr-1">引用:</span> {{ msg.target }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('all')

const tabs = [
  { 
    id: 'all', 
    name: '全部消息', 
    unread: 3,
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>`
  },
  {
    id: 'mentions',
    name: '评论和@我',
    unread: 1,
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>`
  },
  {
    id: 'likes',
    name: '收到的赞',
    unread: 2,
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>`
  },
  {
    id: 'system',
    name: '系统通知',
    unread: 0,
    icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  }
]

const currentTabName = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.name || '消息列表'
})

// Mocks
const mockMessages = [
  {
    id: 1,
    type: 'mentions',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    sender: '路人甲',
    action: '在问题中提到了你',
    content: '我觉得 @管理员 的那个方案更好一些，你们觉得呢？我们可以稍微调整一下。',
    target: '如何使用 Vue 3 组合式 API 写出更优雅的代码？',
    time: '10 分钟前',
    isRead: false
  },
  {
    id: 2,
    type: 'likes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    sender: '热心网友',
    action: '赞了你的回答',
    content: '',
    target: '响应式数据直接修改会造成什么影响？...',
    time: '1 小时前',
    isRead: false
  },
  {
    id: 3,
    type: 'likes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lydia',
    sender: 'Jane Doe',
    action: '赞了你的文章',
    content: '',
    target: '2024 年前端发展趋势解读',
    time: '2 小时前',
    isRead: false
  },
  {
    id: 4,
    type: 'mentions',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    sender: 'Bob Admin',
    action: '回复了你',
    content: '非常感谢你的解答！我现在明白了，原来是 setup 函数的执行时机问题。以后写代码会注意的。',
    target: '我的评论：你可能没注意到生命周期的顺序...',
    time: '昨天 14:20',
    isRead: true
  },
  {
    id: 5,
    type: 'system',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=System',
    sender: '系统通知',
    action: '社区规则更新',
    content: '为了提供更好的交流环境，社区更新了包含友好发帖等的一系列规范，请查收了解。',
    target: '',
    time: '2024-03-21',
    isRead: true
  }
]

const messages = computed(() => {
  if (activeTab.value === 'all') return mockMessages
  return mockMessages.filter(m => m.type === activeTab.value)
})
</script>
