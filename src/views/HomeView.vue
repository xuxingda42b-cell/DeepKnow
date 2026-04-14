<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { TheTab } from '../components/theTab'
import { QuestionItem } from '../components/questionItem'
import { myQuestions } from '../store/questions'
import { isLoggedIn } from '../store/user'
import AiAssistant from '../components/AiAssistant.vue'

const route = useRoute()
const currentTab = ref('推荐')

const queryStr = computed(() => (route.query.q as string) || '')

const handleTabChange = (tab: string) => {
  currentTab.value = tab
}

const getQuestionsByTab = () => {
  let list = myQuestions.value

  if (queryStr.value) {
    const qlower = queryStr.value.toLowerCase()
    list = list.filter(q =>
      q.title.toLowerCase().includes(qlower) ||
      q.description.toLowerCase().includes(qlower) ||
      q.tags.some(t => t.name.toLowerCase().includes(qlower)) ||
      q.author.name.toLowerCase().includes(qlower)
    )
  }

  // Demo filter logic
  if (currentTab.value === '最新') {
    return list
  } else if (currentTab.value === '热门') {
    return [...list].sort((a, b) => b.viewsCount - a.viewsCount)
  }
  return [...list].reverse()
}
</script>

<template>
  <div class="flex flex-col w-full animate-fade-in relative block">

    <!-- 未登录态：着陆页视图 -->
    <div v-if="!isLoggedIn" class="py-20 text-center">
      <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
        寻找答案，<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">分享知识</span>
      </h1>
      <p class="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
        加入我们的开发者社区，与成千上万的同行在线问答。无论是调试 bug，还是探讨架构设计，这里都有您想要的答案。
      </p>

      <div class="flex items-center justify-center gap-4">
        <router-link
          to="/login"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition shadow-lg shadow-blue-500/30"
        >
          立即登录
        </router-link>
        <router-link
          to="/register"
          class="bg-white border hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-full font-medium transition"
        >
          注册新账号
        </router-link>
      </div>

      <!-- 推荐内容展示 (简版) -->
      <div class="mt-16 max-w-4xl mx-auto text-left opacity-60 pointer-events-none filter blur-[2px]">
        <h3 class="text-lg font-bold text-gray-700 mb-4 px-4 text-center">优质讨论先睹为快</h3>
        <QuestionItem
            v-for="question in getQuestionsByTab().slice(0, 2)"
            :key="question.id"
            :question="question"
          />
      </div>
    </div>

    <!-- 登录态：完整的问答时间流 + AI 助手 -->
    <template v-else>
      <TheTab @change="handleTabChange" />

      <!-- Question Feed (full width) -->
      <main class="flex-1 w-full p-4 py-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <template v-if="getQuestionsByTab().length > 0">
            <QuestionItem
              v-for="question in getQuestionsByTab()"
              :key="question.id"
              :question="question"
            />
          </template>
          <template v-else>
            <!-- Empty State -->
            <div class="py-16 px-6 text-center">
              <svg class="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 class="mt-4 text-sm font-medium text-gray-900">{{ queryStr ? '没有找到包含 "'+queryStr+'" 的问题' : '还没有问题哦' }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ queryStr ? '换个搜索词试试看吧！' : '还没有人回答，快来成为第一个吧！' }}</p>
            </div>
          </template>
        </div>
      </main>

      <!-- AI Assistant: fixed panel outside the content flow -->
      <aside class="fixed right-4 top-16 bottom-4 w-80 hidden xl:flex flex-col z-40">
        <AiAssistant />
      </aside>
    </template>
  </div>
</template>
