<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
      <!-- 头部 -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-wrap gap-4">
        <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          我的收藏
        </h1>
        <div class="flex items-center bg-white rounded-lg p-1 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-200">
          <button 
            @click="filterType = 'all'"
            :class="filterType === 'all' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            class="px-5 py-1.5 rounded-md text-sm transition-all"
          >
            全部
          </button>
          <button 
            @click="filterType = 'questions'"
            :class="filterType === 'questions' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            class="px-5 py-1.5 rounded-md text-sm transition-all"
          >
            问题
          </button>
          <button 
            @click="filterType = 'articles'"
            :class="filterType === 'articles' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            class="px-5 py-1.5 rounded-md text-sm transition-all"
          >
            文章
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="px-8 py-4 border-b border-gray-50 bg-white">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="在收藏夹中搜索内容或标签..." 
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm group"
          />
        </div>
      </div>

      <!-- 收藏列表 -->
      <div class="flex-1 overflow-y-auto bg-gray-50/30">
        <div v-if="filteredCollections.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 py-24">
          <svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          <p class="text-sm">尚未收藏任何内容</p>
        </div>
        
        <ul v-else class="divide-y divide-gray-100 bg-white">
          <li v-for="item in filteredCollections" :key="item.id" class="p-8 hover:bg-blue-50/20 transition-colors group cursor-pointer relative">
            <div class="flex justify-between items-start gap-6">
              <div class="flex-1 min-w-0">
                <!-- 徽章和时间 -->
                <div class="flex items-center gap-3 mb-3">
                  <span 
                    class="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded border"
                    :class="item.type === 'question' ? 'bg-orange-50 text-orange-600 border-orange-200/50' : 'bg-purple-50 text-purple-600 border-purple-200/50'"
                  >
                    {{ item.type === 'question' ? '问题' : '文章' }}
                  </span>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    收藏于 {{ item.savedAt }}
                  </span>
                </div>
                
                <!-- 标题 -->
                <router-link :to="`/question/${item.id}`" class="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 mb-2 before:absolute before:inset-0">
                  {{ item.title }}
                </router-link>
                
                <!-- 摘要内容 -->
                <p class="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed pr-8">
                  {{ item.summary }}
                </p>
                
                <!-- 元数据：标签和作者 -->
                <div class="flex items-center justify-between flex-wrap gap-4 relative z-10">
                  <div class="flex items-center gap-2">
                    <span v-for="tag in item.tags" :key="tag" class="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                      {{ tag }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2.5 text-xs text-gray-500">
                    <div class="flex items-center gap-1.5 hover:text-gray-800 transition-colors cursor-pointer">
                      <img :src="item.authorAvatar" alt="Author" class="w-5 h-5 rounded-full object-cover border border-gray-100">
                      <span class="font-medium">{{ item.author }}</span>
                    </div>
                    <span>·</span>
                    <span>{{ item.stats }}</span>
                  </div>
                </div>
              </div>

              <!-- 右侧操作区：取消收藏按钮 -->
              <button class="relative z-10 text-gray-300 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 transition-all group/btn shrink-0 focus:outline-none" title="取消收藏">
                <svg class="w-6 h-6 fill-blue-500 text-blue-500 group-hover/btn:fill-red-50 group-hover/btn:stroke-red-500 group-hover/btn:text-red-500 transition-colors" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filterType = ref('all')

const collections = [
  {
    id: 1,
    type: 'question',
    title: 'Vue3 中的 Composition API 最佳实践是什么？',
    summary: '最近在做团队的 Vue 2 到 Vue 3 迁移，大家对于 setup() 里面到底应该怎么组织代码有很大分歧，想了解一下目前社区里比较推荐的做法是什么？特别是跨组件服用逻辑抽离的界限在哪？',
    tags: ['Vue.js', '前端架构', '最佳实践'],
    author: '前端老兵',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vue',
    stats: '15 回答 · 128 赞',
    savedAt: '昨天 15:30'
  },
  {
    id: 2,
    type: 'article',
    title: '2024年值得关注的 10 个前端开源项目预看',
    summary: '在这个日新月异的技术圈，前端工具链又迎来了一波大更新。本文将盘点最近在 GitHub 上爆火的，能切实提升生产效率的开源项目库。',
    tags: ['开源生态', '工具链'],
    author: '框架爱好者',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
    stats: '阅读量 2.1w · 456 赞',
    savedAt: '3天前'
  },
  {
    id: 3,
    type: 'question',
    title: '如何优雅地处理大型业务中极度复杂的表单校验？',
    summary: '遇到一个大概有 50 多个字段，分布在 4 个 Tab 页，部分字段显示隐藏产生联动影响的超级复杂业务表单。目前代码全部耦合在一起，维护非常痛苦。各位大佬是怎么解耦的？',
    tags: ['JavaScript', '表单', '架构设计'],
    author: 'Code Ninja',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja',
    stats: '24 回答 · 89 赞',
    savedAt: '2024-03-10'
  }
]

const filteredCollections = computed(() => {
  if (filterType.value === 'all') return collections
  const t = filterType.value === 'questions' ? 'question' : 'article'
  return collections.filter(c => c.type === t)
})
</script>
