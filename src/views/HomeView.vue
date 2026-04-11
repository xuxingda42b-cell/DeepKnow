<script setup lang="ts">
import { ref } from 'vue'
import { TheTab } from '../components/theTab'
import { QuestionItem } from '../components/questionItem'
import { questionsData } from '../data/questions'

const currentTab = ref('推荐')

const handleTabChange = (tab: string) => {
  currentTab.value = tab
}

const getQuestionsByTab = () => {
  // Demo filter logic
  if (currentTab.value === '最新') {
    return questionsData
  } else if (currentTab.value === '热门') {
    return [...questionsData].sort((a, b) => b.viewsCount - a.viewsCount)
  }
  return [...questionsData].reverse()
}
</script>

<template>
  <div class="flex flex-col w-full animate-fade-in">
    <TheTab @change="handleTabChange" />

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
            <h3 class="mt-4 text-sm font-medium text-gray-900">还没有问题哦</h3>
            <p class="mt-1 text-sm text-gray-500">还没有人回答，快来成为第一个吧！</p>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
