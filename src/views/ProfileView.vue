<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 w-full">
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
            <div class="text-xl font-bold text-gray-900">{{ userQuestions.length }}</div>
            <div class="text-xs text-gray-500 mt-1">提问</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">{{ userArticles.length }}</div>
            <div class="text-xs text-gray-500 mt-1">文章</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">{{ userAnswers.length }}</div>
            <div class="text-xs text-gray-500 mt-1">回答</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">{{ userComments.length }}</div>
            <div class="text-xs text-gray-500 mt-1">评论</div>
          </div>
        </div>

        <!-- 标签页与内容 -->
        <div>
          <div class="flex gap-6 border-b border-gray-100 overflow-x-auto whitespace-nowrap">
            <button
              @click="activeTab = 'profile'"
              :class="['pb-3 font-medium text-sm transition-colors shrink-0', activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              个人资料
            </button>
            <button
              @click="activeTab = 'recent'"
              :class="['pb-3 font-medium text-sm transition-colors shrink-0', activeTab === 'recent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              最近动态
            </button>
            <button
              @click="activeTab = 'questions'"
              :class="['pb-3 font-medium text-sm transition-colors shrink-0', activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              我的提问
            </button>
            <button
              @click="activeTab = 'articles'"
              :class="['pb-3 font-medium text-sm transition-colors shrink-0', activeTab === 'articles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              我的文章
            </button>
            <button
              @click="activeTab = 'comments'"
              :class="['pb-3 font-medium text-sm transition-colors shrink-0', activeTab === 'comments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
              我的评论
            </button>
            <button
              @click="activeTab = 'answers'"
              :class="['pb-3 font-medium text-sm transition-colors shrink-0', activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']">
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

          <!-- 通用列表容器 -->
          <div v-show="activeTab !== 'profile'" class="py-6">

            <!-- 最近动态 -->
            <div v-if="activeTab === 'recent'">
              <div v-if="!recentActivities.length" class="py-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                暂无动态数据
              </div>
              <div v-else class="space-y-6">
                <div v-for="item in recentActivities" :key="item.id" class="flex gap-4 group mb-6 pb-6 border-b border-gray-50">
                   <div class="flex-1 min-w-0">
                     <p v-if="item.type === 'comment' || item.type === 'answer'" class="text-sm text-gray-500 mb-2">
                       在 <router-link :to="item.link" class="text-blue-500 hover:underline">{{ item.sourceTitle }}</router-link> {{ item.action }} · {{ item.createdAt.slice(0, 16) }}
                     </p>
                     <p v-else class="text-sm text-gray-500 mb-2">{{ item.action }} · {{ item.createdAt.slice(0, 16) }}</p>

                     <router-link :to="item.link" v-if="item.title" class="text-lg font-bold text-gray-800 hover:text-blue-600 mb-2 block line-clamp-1">{{ item.title }}</router-link>
                     <div class="prose prose-sm max-w-none text-gray-600 line-clamp-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100" v-html="parseMarkdown(item.content)"></div>
                   </div>
                </div>
              </div>
            </div>

            <!-- 我的提问 -->
            <div v-if="activeTab === 'questions'">
              <div v-if="!userQuestions.length" class="py-16 text-center text-gray-400 text-sm">暂无提问数据</div>
              <div v-for="q in userQuestions" :key="q.id" class="mb-4 pb-4 border-b border-gray-50">
                 <router-link :to="`/question/${q.id}`" class="text-base font-bold text-gray-800 hover:text-blue-600">{{ q.title }}</router-link>
                 <p class="text-sm text-gray-500 mt-2">{{ q.time.slice(0, 16) }} · {{ q.answersCount }} 回答</p>
              </div>
            </div>

            <!-- 我的文章 -->
            <div v-if="activeTab === 'articles'">
              <div v-if="!userArticles.length" class="py-16 text-center text-gray-400 text-sm">暂无文章数据</div>
              <div v-for="a in userArticles" :key="a.id" class="mb-4 pb-4 border-b border-gray-50">
                 <router-link :to="`/article/${a.id}`" class="text-base font-bold text-gray-800 hover:text-blue-600">{{ a.title }}</router-link>
                 <p class="text-sm text-gray-500 mt-2">{{ a.createdAt.slice(0, 16) }} · {{ a.viewsCount }} 阅读</p>
              </div>
            </div>

            <!-- 我的评论 -->
            <div v-if="activeTab === 'comments'">
              <div v-if="!userComments.length" class="py-16 text-center text-gray-400 text-sm">暂无评论数据</div>
              <div v-for="c in userComments" :key="c.id" class="mb-4 pb-4 border-b border-gray-50">
                 <p class="text-sm text-gray-500 mb-2">在 <router-link :to="c.link" class="text-blue-500 hover:underline">{{ c.sourceTitle }}</router-link> 发布了评论：</p>
                 <div class="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-3 rounded-lg border border-gray-100" v-html="parseMarkdown(c.content)"></div>
                 <p class="text-xs text-gray-400 mt-2">{{ c.createdAt.slice(0, 16) }}</p>
              </div>
            </div>

            <!-- 我的回答 -->
            <div v-if="activeTab === 'answers'">
              <div v-if="!userAnswers.length" class="py-16 text-center text-gray-400 text-sm">暂无回答数据</div>
              <div v-for="ans in userAnswers" :key="ans.id" class="mb-4 pb-4 border-b border-gray-50">
                 <p class="text-sm text-gray-500 mb-2">在 <router-link :to="ans.link" class="text-blue-500 hover:underline">{{ ans.sourceTitle }}</router-link> 发布了回答：</p>
                 <div class="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-3 rounded-lg border border-gray-100 line-clamp-3" v-html="parseMarkdown(ans.content)"></div>
                 <p class="text-xs text-gray-400 mt-2">{{ ans.createdAt.slice(0, 16) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { myQuestions } from '../store/questions'
import { allAnswers } from '../store/answers'
import { myArticles } from '../store/articles'
import * as markedPkg from 'marked'
import * as DOMPurifyPkg from 'dompurify'

const marked = markedPkg.marked || markedPkg
const DOMPurify = DOMPurifyPkg.default || DOMPurifyPkg

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

const parseMarkdown = (raw: string) => {
  if (!raw) return ''
  return DOMPurify.sanitize(marked.parse(raw, { breaks: true, gfm: true }) as string)
}

const userQuestions = computed(() => {
  return myQuestions.value.filter(q => q.author.name === profileData.name)
})

const userArticles = computed(() => {
  return myArticles.value.filter(a => a.author.name === profileData.name)
})

const userAnswers = computed(() => {
  return allAnswers.value
    .filter(a => a.author.name === profileData.name)
    .map(a => {
      const q = myQuestions.value.find(q => String(q.id) === String(a.questionId))
      return {
        ...a,
        sourceTitle: q ? q.title : '未知提问',
        link: `/question/${a.questionId}`
      }
    })
})

const userComments = computed(() => {
  const ansComments = allAnswers.value.flatMap(a => {
    const q = myQuestions.value.find(q => String(q.id) === String(a.questionId))
    return (a.comments || []).map(c => ({
      ...c,
      sourceType: 'answer',
      sourceTitle: q ? q.title : '未知提问',
      link: `/question/${a.questionId}`
    }))
  })

  const artComments = myArticles.value.flatMap(a => (a.comments || []).map(c => ({
    ...c,
    sourceType: 'article',
    sourceTitle: a.title,
    link: `/article/${a.id}`
  })))

  return [...ansComments, ...artComments]
    .filter(c => c.author.name === profileData.name)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const recentActivities = computed(() => {
  const items: Array<{
    id: string;
    type: string;
    action: string;
    title: string;
    content: string;
    createdAt: string;
    link: string;
    sourceTitle?: string;
  }> = []

  userQuestions.value.forEach(q => items.push({
    id: `q-${q.id}`, type: 'question', action: '发布了提问',
    title: q.title, content: q.description,
    createdAt: q.time, link: `/question/${q.id}`
  }))

  userArticles.value.forEach(a => items.push({
    id: `a-${a.id}`, type: 'article', action: '发布了文章',
    title: a.title, content: a.summary,
    createdAt: a.createdAt, link: `/article/${a.id}`
  }))

  userComments.value.forEach(c => items.push({
    id: `c-${c.id}`, type: 'comment', action: `发表了评论`,
    title: '', content: c.content,
    createdAt: c.createdAt, link: c.link,
    sourceTitle: c.sourceTitle
  }))

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

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
