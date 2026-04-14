<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as markedPkg from 'marked'
import * as DOMPurifyPkg from 'dompurify'
import { getArticleById, deleteArticle, incrementArticleViews } from '../store/articles'

const marked = markedPkg.marked || markedPkg
const DOMPurify = DOMPurifyPkg.default || DOMPurifyPkg

const route = useRoute()
const router = useRouter()
const articleId = route.params.id as string

const savedProfile = localStorage.getItem('profile_data')
const profileName = savedProfile ? JSON.parse(savedProfile).name || '我' : '我'

const article = computed(() => getArticleById(articleId))

if (article.value) {
  incrementArticleViews(articleId)
}

const parsedContent = computed(() => {
  if (!article.value) return ''
  return DOMPurify.sanitize(marked.parse(article.value.content, { breaks: true, gfm: true }) as string)
})

const formatDate = (str: string) => str.slice(0, 16)

const doDelete = () => {
  if (confirm('确定要删除这篇文章吗？')) {
    deleteArticle(articleId)
    router.push('/')
  }
}
</script>

<template>
  <div class="animate-fade-in w-full pb-20">
    <!-- Not found -->
    <div v-if="!article" class="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg font-medium">文章不存在或已被删除</p>
      <router-link to="/" class="mt-4 inline-block text-blue-600 hover:underline text-sm">返回首页</router-link>
    </div>

    <template v-else>
      <!-- Article Header -->
      <div class="bg-white border-b border-gray-200 shadow-sm px-4 py-10 sm:px-8 mb-8">
        <div class="max-w-3xl mx-auto">
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-semibold"
            >
              # {{ tag }}
            </span>
          </div>
          <!-- Title -->
          <h1 class="text-3xl font-bold text-slate-900 mb-5 leading-tight">{{ article.title }}</h1>
          <!-- Author Meta -->
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3 text-sm text-slate-500">
              <img :src="article.author.avatar" class="w-9 h-9 rounded-full border border-gray-100 bg-gray-50" />
              <div>
                <p class="font-medium text-slate-700">{{ article.author.name }}</p>
                <p class="text-xs">发布于 {{ formatDate(article.createdAt) }} · {{ article.viewsCount }} 阅读</p>
              </div>
            </div>
            <!-- Author actions -->
            <div v-if="article.author.name === profileName" class="flex items-center gap-2">
              <router-link
                :to="`/article/edit/${article.id}`"
                class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >编辑</router-link>
              <button
                @click="doDelete"
                class="px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              >删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Article Body -->
      <div class="max-w-3xl mx-auto px-4 sm:px-8">
        <div
          class="bg-white rounded-xl border border-gray-100 shadow-sm px-6 sm:px-10 py-8 prose max-w-none text-slate-800 leading-relaxed text-[15px] break-words article-prose"
          v-html="parsedContent"
        ></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.article-prose) h1 { font-size: 1.8rem; font-weight: 700; margin: 1.4rem 0 0.7rem; color: #1e293b; }
:deep(.article-prose) h2 { font-size: 1.4rem; font-weight: 700; margin: 1.2rem 0 0.6rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.4rem; }
:deep(.article-prose) h3 { font-size: 1.15rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #334155; }
:deep(.article-prose) p { margin: 0.85rem 0; line-height: 1.8; }
:deep(.article-prose) pre {
  background: #1e293b; color: #e2e8f0;
  border-radius: 0.5rem; padding: 1rem;
  overflow-x: auto; margin: 1rem 0; font-size: 0.875rem;
}
:deep(.article-prose) code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
:deep(.article-prose) p code, :deep(.article-prose) li code {
  background: #f1f5f9; color: #ec4899;
  padding: 1px 5px; border-radius: 4px; font-size: 0.875em;
}
:deep(.article-prose) blockquote {
  border-left: 4px solid #818cf8;
  padding: 0.5rem 1rem; margin: 1rem 0;
  color: #64748b; background: #eef2ff;
  border-radius: 0 0.5rem 0.5rem 0; font-style: italic;
}
:deep(.article-prose) ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.article-prose) ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.article-prose) li { margin: 0.3rem 0; }
:deep(.article-prose) a { color: #6366f1; text-decoration: underline; }
:deep(.article-prose) hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
:deep(.article-prose) img { max-width: 100%; border-radius: 0.5rem; }
:deep(.article-prose) table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
:deep(.article-prose) th { background: #f8fafc; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; font-weight: 600; }
:deep(.article-prose) td { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; }
:deep(.article-prose) strong { font-weight: 600; color: #1e293b; }
</style>
