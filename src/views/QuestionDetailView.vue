<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as markedPkg from 'marked'
import * as DOMPurifyPkg from 'dompurify'

const marked = markedPkg.marked || markedPkg
const DOMPurify = DOMPurifyPkg.default || DOMPurifyPkg

const parseMarkdown = (raw: string) => {
  if (!raw) return ''
  // marked.parse may return a promise in some configurations, but defaults to string.
  return DOMPurify.sanitize(marked.parse(raw, { breaks: true, gfm: true }) as string)
}

// 评论类型
interface Comment {
  id: number
  author: { name: string; avatar: string }
  content: string
  createdAt: string
}

const route = useRoute()
const questionId = route.params.id

// Mock Question Data
const question = ref({
  id: questionId,
  title: '如何在 Vue 3 中优雅地使用组合式 API 管理状态？',
  content: `
    <p class="mb-4">最近在重构一个项目，感觉对于全局状态的处理有点乱。想请教大家，如果不使用 Pinia 或 Vuex，单靠 Provide/Inject 或者响应式对象，有没有什么最佳实践？</p>
    <pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code class="language-javascript">const globalState = reactive({ 
  user: null,
  theme: 'light' 
})
export const useGlobalState = () => globalState</code></pre>
    <p>这样做有没有什么性能或者测试上的隐患？</p>
  `,
  author: { name: '前端探路者', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&scale=200' },
  createdAt: '2026-04-10 10:24:00',
  isAuthor: false, // If true, show Edit button
  tags: ['Vue.js', 'JavaScript', '前端开发'],
  readCount: 1420
})

// Mock Answers Data
const answers = ref([
  {
    id: 1,
    author: { name: '尤大粉', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Evan&scale=200' },
    content: `
      <p class="mb-4">个人经验，如果只有很少几个全局状态，你写的这种直接 export 一个 reactive 对象的模式完全没问题（通常被称为 Store 模式）。</p>
      <blockquote class="border-l-4 border-blue-400 pl-4 py-1 my-4 text-slate-600 bg-slate-50 italic rounded-r-md">
        如果没有跨请求状态污染的问题（客户端渲染或使用单独实例的 SSR），这种模式非常轻量级。
      </blockquote>
      <p>但如果你希望按组件树进行状态隔离，或者利用 Vue 开发者工具的追踪功能，还是推荐上 Pinia。如果非要坚持原生，可以使用 <code class="bg-slate-100 text-pink-500 px-1 py-0.5 rounded text-sm">provide / inject</code>，结合 <code class="bg-slate-100 text-pink-500 px-1 py-0.5 rounded text-sm">readonly</code>。</p>
    `,
    points: 156,
    isAccepted: true,
    createdAt: '2026-04-10 11:30:00',
    userVoted: 0,
    comments: [
      {
        id: 101,
        author: { name: '好奇宝宝', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Curious&scale=200' },
        content: '请问这样的 Store 模式在 **SSR** 下有什么坑吗？',
        createdAt: '2026-04-10 13:00:00',
      },
      {
        id: 102,
        author: { name: '尤大粉', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Evan&scale=200' },
        content: 'SSR 下单例会造成跨请求污染，需要用工厂函数 `createStore()` 搭配 `provide`。',
        createdAt: '2026-04-10 13:20:00',
      },
    ] as Comment[],
  },
  {
    id: 2,
    author: { name: '全栈修理工', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jack&scale=200' },
    content: '<p>同意楼上。如果你担心热更新或者 SSR 的单例污染，建议包装在函数中并在 App 级别 provide：</p><pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code class="language-ts">export function createStore() {\n  return reactive({ count: 0 })\n}</code></pre>',
    points: 42,
    isAccepted: false,
    createdAt: '2026-04-10 12:15:00',
    userVoted: 0,
    comments: [] as Comment[],
  },
  {
    id: 3,
    author: { name: 'CtrlC_CtrlV', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob&scale=200' },
    content: '<p>直接用 Pinia 啊，何必自己造轮子呢，性能优化和 TS 推导官方都帮你做好了。直接用 Pinia 啊，何必自己造轮子呢，性能优化和 TS 推导官方都帮你做好了。</p>',
    points: -2,
    isAccepted: false,
    createdAt: '2026-04-10 14:00:00',
    userVoted: -1,
    comments: [] as Comment[],
  }
])

// 评论区展开状态：key 为 answerId
const expandedComments = ref<Record<number, boolean>>({})
// 每个回答的评论输入内容
const commentInputs = ref<Record<number, string>>({})

const toggleComments = (answerId: number) => {
  expandedComments.value[answerId] = !expandedComments.value[answerId]
}

const submitComment = (answer: (typeof answers.value)[0]) => {
  const text = (commentInputs.value[answer.id] ?? '').trim()
  if (!text) return
  answer.comments.push({
    id: Date.now(),
    author: { name: '我', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' },
    content: text,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
  commentInputs.value[answer.id] = ''
}

// Sort Answers: Accepted -> Points Descending -> Chronological
const sortedAnswers = computed(() => {
  return [...answers.value].sort((a, b) => {
    if (a.isAccepted) return -1
    if (b.isAccepted) return 1
    if (b.points !== a.points) return b.points - a.points
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
})

const handleVote = (answer: { points: number; userVoted: number }, type: 1 | -1) => {
  if (answer.userVoted === type) {
    // Cancel vote
    answer.points -= type
    answer.userVoted = 0
  } else {
    // Change or fresh vote
    if (answer.userVoted !== 0) {
      answer.points -= answer.userVoted
    }
    answer.points += type
    answer.userVoted = type
  }
}

// Editor state
const showEditor = ref(false)
const answerContent = ref('')
const editorWrapper = ref<HTMLElement | null>(null)

const toggleEditor = () => {
  showEditor.value = !showEditor.value
  if (showEditor.value) {
    nextTick(() => {
      editorWrapper.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }
}

const submitAnswer = () => {
  if (!answerContent.value.trim()) return
  // Mock add
  answers.value.push({
    id: Date.now(),
    author: { name: '我', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' },
    content: answerContent.value,
    points: 0,
    isAccepted: false,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    userVoted: 0,
    comments: [] as Comment[],
  })
  answerContent.value = ''
  showEditor.value = false
}

// Utility formatting
const formatDate = (dateStr: string) => dateStr.slice(0, 16)
</script>

<template>
  <div class="animate-fade-in w-full pb-20">
    <!-- Header / Question Area -->
    <div class="bg-white px-4 py-8 sm:px-8 border-b border-gray-200 shadow-sm mb-6">
      <div class="max-w-4xl mx-auto">
        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in question.tags" :key="tag" class="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
            # {{ tag }}
          </span>
        </div>
        
        <!-- Title -->
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">
          {{ question.title }}
        </h1>
        
        <!-- Author Info & Meta -->
        <div class="flex items-center text-sm text-slate-500 mb-6 gap-3">
          <img :src="question.author.avatar" alt="avatar" class="w-8 h-8 rounded-full border border-gray-100 bg-gray-50" />
          <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-1">
            <span class="font-medium text-slate-700 hover:text-blue-600 cursor-pointer">{{ question.author.name }}</span>
            <span class="hidden sm:inline text-slate-300">|</span>
            <span>提问于 {{ formatDate(question.createdAt) }}</span>
            <span class="hidden sm:inline text-slate-300">|</span>
            <span>阅读 {{ question.readCount }}</span>
          </div>
        </div>

        <!-- Question Body (Rich Text Content) -->
        <div class="prose max-w-none text-slate-800 leading-relaxed text-[15px] mb-8 break-words" v-html="parseMarkdown(question.content)"></div>

        <!-- Action Bar -->
        <div class="flex flex-wrap items-center justify-between border-t border-gray-100 pt-4">
          <button @click="toggleEditor" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 transform active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            写回答
          </button>

          <div class="flex items-center gap-2 sm:gap-4 text-slate-500">
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              分享
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors hover:text-amber-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              收藏
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" /></svg>
              举报
            </button>
            <button v-if="question.isAuthor" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-blue-600">
              编辑
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Answers List Area -->
    <div class="max-w-4xl mx-auto px-4 sm:px-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-slate-800">{{ answers.length }} 个回答</h2>
        <span class="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full shadow-inner">默认排序 (采纳/高赞优先)</span>
      </div>

      <div class="space-y-4">
        <div 
          v-for="answer in sortedAnswers" 
          :key="answer.id" 
          class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md flex gap-4 lg:gap-6 relative overflow-hidden"
          :class="{'ring-1 ring-emerald-400': answer.isAccepted}"
        >
          <!-- Accepted Badge Background visual hint -->
          <div v-if="answer.isAccepted" class="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div class="absolute transform rotate-45 bg-emerald-400 text-white text-[10px] font-bold py-1 right-[-35px] top-[15px] w-[120px] text-center shadow-sm">已采纳</div>
          </div>

          <!-- Left: Vote Controls -->
          <div class="flex flex-col items-center gap-2 shrink-0 w-12 pt-1 border-r border-slate-50 pr-4 sm:pr-0 sm:border-0 sm:w-10">
            <!-- Upvote -->
            <button 
              @click="handleVote(answer, 1)"
              class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm border border-transparent"
              :class="answer.userVoted === 1 ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500'"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 4l-8 8h16z" /></svg>
            </button>
            
            <span class="font-bold text-slate-700 select-none text-center tabular-nums w-full" :class="{'text-blue-600': answer.userVoted === 1, 'text-red-500': answer.userVoted === -1}">
              {{ answer.points }}
            </span>
            
            <!-- Downvote -->
            <button 
              @click="handleVote(answer, -1)"
              class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm border border-transparent"
              :class="answer.userVoted === -1 ? 'bg-red-100 text-red-600 border-red-200' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 20l8-8H4z" /></svg>
            </button>

            <!-- Accepted icon -->
            <div v-if="answer.isAccepted" class="mt-4 text-emerald-500" title="该回答被提问者采纳">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
            </div>
          </div>

          <!-- Right: Answer Content -->
          <div class="flex-1 min-w-0">
            <!-- Author Header -->
            <div class="flex items-center gap-3 mb-3">
              <img :src="answer.author.avatar" alt="avatar" class="w-8 h-8 rounded border border-gray-100 aspect-square object-cover" />
              <div>
                <div class="text-sm font-semibold text-slate-800">{{ answer.author.name }}</div>
                <div class="text-xs text-slate-400">发布于 {{ formatDate(answer.createdAt) }}</div>
              </div>
            </div>

            <!-- Content (Rich Text) -->
            <div class="prose prose-sm sm:prose max-w-none text-slate-700 leading-relaxed text-[15px] mb-4 break-words prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-p:mb-3" v-html="parseMarkdown(answer.content)"></div>

            <!-- Bottom Actions -->
            <div class="flex items-center gap-4 text-sm text-slate-500 pt-3 flex-wrap">
              <button
                class="flex items-center gap-1 hover:text-blue-600 transition-colors"
                @click="toggleComments(answer.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {{ answer.comments.length > 0 ? `${answer.comments.length} 条评论` : '添加评论' }}
              </button>
              <button class="flex items-center gap-1 hover:text-slate-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                分享
              </button>
              <button class="flex items-center gap-1 hover:text-slate-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" /></svg>
                举报
              </button>
            </div>

            <!-- 评论区 -->
            <div
              v-if="expandedComments[answer.id]"
              class="mt-3 border-t border-slate-100 pt-3 space-y-3 comment-section"
            >
              <!-- 已有评论列表 -->
              <div
                v-for="comment in answer.comments"
                :key="comment.id"
                class="flex gap-2.5 group"
              >
                <img
                  :src="comment.author.avatar"
                  alt="avatar"
                  class="w-6 h-6 rounded-full border border-gray-100 bg-gray-50 shrink-0 mt-0.5"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-1.5 flex-wrap">
                    <span class="text-xs font-semibold text-slate-700 shrink-0">{{ comment.author.name }}</span>
                    <span class="text-[11px] text-slate-400 shrink-0">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <!-- 评论内容支持 Markdown/HTML 渲染 -->
                  <div
                    class="text-xs text-slate-600 comment-prose mt-0.5"
                    v-html="parseMarkdown(comment.content)"
                  ></div>
                </div>
              </div>

              <!-- 无评论提示 -->
              <p v-if="answer.comments.length === 0" class="text-xs text-slate-400 italic">暂无评论，快来抢沙发～</p>

              <!-- 评论输入框 -->
              <div class="flex gap-2 pt-1">
                <img
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200"
                  alt="me"
                  class="w-6 h-6 rounded-full border border-gray-100 bg-gray-50 shrink-0 mt-1"
                />
                <div class="flex-1 flex gap-2">
                  <input
                    v-model="commentInputs[answer.id]"
                    type="text"
                    placeholder="添加评论... 支持 Markdown"
                    class="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white placeholder-slate-400 text-slate-700 transition"
                    @keydown.enter="submitComment(answer)"
                  />
                  <button
                    @click="submitComment(answer)"
                    :disabled="!(commentInputs[answer.id] ?? '').trim()"
                    class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >发布</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor Area -->
      <div 
        ref="editorWrapper"
        class="mt-8 transition-all duration-500 overflow-hidden" 
        :class="showEditor ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0'"
      >
        <div class="bg-white border text-left border-gray-200 rounded-xl shadow-sm p-1">
          <!-- Toolbar Mock -->
          <div class="flex flex-wrap items-center gap-1 bg-slate-50 p-2 border-b border-gray-100 rounded-t-lg text-slate-500">
            <button class="p-1.5 hover:bg-white hover:text-slate-800 rounded transition-colors" title="加粗"><strong class="font-serif">B</strong></button>
            <button class="p-1.5 hover:bg-white hover:text-slate-800 rounded transition-colors" title="斜体"><em class="font-serif">I</em></button>
            <div class="w-px h-4 bg-gray-300 mx-1"></div>
            <button class="p-1.5 hover:bg-white hover:text-slate-800 rounded transition-colors" title="引用"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></button>
            <button class="p-1.5 hover:bg-white hover:text-slate-800 rounded transition-colors" title="代码块"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
            <button class="p-1.5 hover:bg-white hover:text-slate-800 rounded transition-colors" title="上传图片"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
            <span class="ml-auto text-xs text-slate-400 hidden sm:inline">支持 Markdown 语法</span>
          </div>

          <textarea 
            v-model="answerContent"
            rows="6" 
            placeholder="撰写你的回答... 支持 Markdown" 
            class="w-full p-4 focus:outline-none resize-y min-h-[150px] text-slate-700 bg-transparent placeholder-slate-400"
          ></textarea>
          
          <div class="flex items-center justify-end gap-3 p-3 bg-slate-50 border-t border-gray-100 rounded-b-lg">
            <button @click="toggleEditor" class="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">取消</button>
            <button 
              @click="submitAnswer"
              :disabled="!answerContent.trim()"
              class="px-5 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >发布回答</button>
          </div>
        </div>
      </div>
    </div>
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

/* Custom styling for rich text mockup */
:deep(.prose) {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
:deep(.prose) pre {
  margin: 1em 0;
  padding: 1em;
  border-radius: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  max-width: 100%;
}
:deep(.prose) p, :deep(.prose) h1, :deep(.prose) h2, :deep(.prose) h3, :deep(.prose) h4, :deep(.prose) h5, :deep(.prose) h6 {
  word-break: break-word;
}
:deep(.prose) img {
  max-width: 100%;
  height: auto;
}
:deep(.prose) code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  word-break: break-word;
}

/* 评论富文本渲染样式 */
:deep(.comment-prose) p {
  margin: 0.25rem 0;
  line-height: 1.5;
}
:deep(.comment-prose) p:first-child {
  margin-top: 0;
}
:deep(.comment-prose) p:last-child {
  margin-bottom: 0;
}
:deep(.comment-prose) code {
  font-size: 0.72rem;
  padding: 1px 4px;
  background: #f1f5f9;
  border-radius: 3px;
  color: #ec4899;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
:deep(.comment-prose) pre {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  overflow-x: auto;
  margin: 0.4rem 0;
  font-size: 0.72rem;
}
:deep(.comment-prose) pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}
:deep(.comment-prose) strong {
  font-weight: 600;
  color: #334155;
}
:deep(.comment-prose) em {
  font-style: italic;
}
:deep(.comment-prose) a {
  color: #3b82f6;
  text-decoration: underline;
}
:deep(.comment-prose) blockquote {
  border-left: 3px solid #93c5fd;
  padding-left: 0.6rem;
  margin: 0.3rem 0;
  color: #64748b;
  font-style: italic;
}
:deep(.comment-prose) ul, :deep(.comment-prose) ol {
  padding-left: 1.2rem;
  margin: 0.25rem 0;
}
:deep(.comment-prose) li {
  margin: 0.1rem 0;
}
</style>
