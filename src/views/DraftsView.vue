<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
      <!-- 头部 -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-wrap gap-4">
        <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          我的草稿
        </h1>
      </div>

      <!-- 草稿列表 -->
      <div class="flex-1 overflow-y-auto bg-gray-50/30">
        <div v-if="myDrafts.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 py-24">
          <svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <p class="text-sm">暂无草稿</p>
          <router-link to="/article/write" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">去写文章</router-link>
        </div>
        
        <ul v-else class="divide-y divide-gray-100 bg-white">
          <li v-for="draft in myDrafts" :key="draft.id" class="p-8 hover:bg-blue-50/20 transition-colors group cursor-pointer relative">
            <div class="flex justify-between items-start gap-6">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    最后编辑于 {{ draft.updatedAt }}
                  </span>
                </div>
                
                <!-- 点击直接使用写文章页面读取这篇草稿 -->
                <router-link :to="`/article/write?draft=${draft.id}`" class="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 mb-2 before:absolute before:inset-0">
                  {{ draft.title || '无标题' }}
                </router-link>
                
                <p class="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed pr-8">
                  {{ draft.content || '没有内容' }}
                </p>
                
                <div class="flex items-center gap-2 relative z-10">
                  <span v-for="tag in draft.tags" :key="tag" class="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-full">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 右侧操作区 -->
              <button @click.prevent.stop="handleRemove(draft.id)" class="relative z-10 text-gray-300 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 transition-all focus:outline-none" title="删除草稿">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { myDrafts, deleteDraft } from '../store/drafts'

const handleRemove = (id: string) => {
  if (window.confirm('确定要删除这篇草稿吗？')) {
    deleteDraft(id)
  }
}
</script>
