<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as markedPkg from 'marked'
import * as DOMPurifyPkg from 'dompurify'
import { isCollected, addCollection, removeCollection } from '../store/collections'
import { myQuestions, deleteQuestion, incrementViews } from '../store/questions'
import { addNotification } from '../store/notifications'

import { getAnswersByQuestionId, submitAnswerToStore, deleteAnswer, type Answer } from '../store/answers'

const marked = markedPkg.marked || markedPkg
const DOMPurify = DOMPurifyPkg.default || DOMPurifyPkg

const parseMarkdown = (raw: string) => {
  if (!raw) return ''
  // marked.parse may return a promise in some configurations, but defaults to string.
  return DOMPurify.sanitize(marked.parse(raw, { breaks: true, gfm: true }) as string)
}

const route = useRoute()
const router = useRouter()
const questionId = route.params.id as string

const realQ = myQuestions.value.find(q => String(q.id) === String(questionId))
const savedProfile = localStorage.getItem('profile_data')
const profileName = savedProfile ? JSON.parse(savedProfile).name || '我' : '我'

if (realQ) {
  incrementViews(questionId)
}

// Mock or real Question Data
const question = ref({
  id: questionId,
  title: realQ ? realQ.title : '如何在 Vue 3 中优雅地使用组合式 API 管理状态？',
  content: realQ ? realQ.description : `
    <p class="mb-4">最近在重构一个项目，感觉对于全局状态的处理有点乱。想请教大家，如果不使用 Pinia 或 Vuex，单靠 Provide/Inject 或者响应式对象，有没有什么最佳实践？</p>
    <pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code class="language-javascript">const globalState = reactive({ 
  user: null,
  theme: 'light' 
})
export const useGlobalState = () => globalState</code></pre>
    <p>这样做有没有什么性能或者测试上的隐患？</p>
  `,
  author: realQ ? realQ.author : { name: '前端探路者', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&scale=200' },
  createdAt: realQ ? realQ.time : '2026-04-10 10:24:00',
  isAuthor: realQ ? realQ.author.name === profileName : false, // If true, show Edit/Delete buttons
  tags: realQ ? realQ.tags.map((t: { name: string }) => t.name) : ['Vue.js', 'JavaScript', '前端开发'],
  readCount: realQ ? realQ.viewsCount : 1420
})

const doDeleteQuestion = () => {
  if (confirm('确定要删除这个问题吗？此操作不可恢复。')) {
    deleteQuestion(question.value.id)
    router.push('/')
  }
}

const answers = computed(() => getAnswersByQuestionId(questionId))

// 评论区展开状态：key 为 answerId
const expandedComments = ref<Record<number, boolean>>({})
// 每个回答的评论输入内容
const commentInputs = ref<Record<number, string>>({})

const toggleComments = (answerId: number) => {
  expandedComments.value[answerId] = !expandedComments.value[answerId]
}

const submitComment = (answer: Answer) => {
  const text = (commentInputs.value[answer.id] ?? '').trim()
  if (!text) return
  answer.comments.push({
    id: Date.now(),
    author: { name: profileName, avatar: savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' : 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' },
    content: text,
    createdAt: (() => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const now = new Date();
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    })()
  })
  commentInputs.value[answer.id] = ''
}

const deleteComment = (answer: Answer, commentId: number) => {
  if (confirm('确定要删除这条评论吗？')) {
    answer.comments = answer.comments.filter(c => c.id !== commentId)
  }
}

const doDeleteAnswer = (answerId: number) => {
  if (confirm('确定要删除这个回答吗？')) {
    deleteAnswer(answerId)
  }
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
  submitAnswerToStore({
    id: Date.now(),
    questionId: questionId,
    author: { name: profileName, avatar: savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' : 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' },
    content: answerContent.value,
    points: 0,
    isAccepted: false,
    createdAt: (() => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const now = new Date();
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    })(),
    userVoted: 0,
    comments: []
  })
  answerContent.value = ''
  showEditor.value = false
}

// Utility formatting
const formatDate = (dateStr: string) => dateStr.slice(0, 16)

// Collection state
const hasCollected = computed(() => isCollected(question.value.id, 'question'))

const toggleCollect = () => {
  if (hasCollected.value) {
    removeCollection(question.value.id, 'question')
  } else {
    // 提取纯文本摘要
    const plainText = question.value.content.replace(/<[^>]*>?/gm, '').trim()
    addCollection({
      id: question.value.id,
      type: 'question',
      title: question.value.title,
      summary: plainText.slice(0, 120) + (plainText.length > 120 ? '...' : ''),
      tags: question.value.tags,
      author: question.value.author.name,
      authorAvatar: question.value.author.avatar,
      stats: `${answers.value.length} 回答 · ${question.value.readCount} 阅读`,
      savedAt: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
    })
  }
}

// Share Logic
const showShareModal = ref(false)
const wechatQrCodeVisible = ref(false)
const currentShareUrl = ref('')

const openShare = () => {
  currentShareUrl.value = window.location.href
  wechatQrCodeVisible.value = false
  showShareModal.value = true
}

const handleShareWeChat = () => {
  wechatQrCodeVisible.value = true
}

const handleShareQQ = () => {
  const title = encodeURIComponent(question.value.title)
  const url = encodeURIComponent(currentShareUrl.value)
  window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&summary=${encodeURIComponent('来看看这个有趣的问答')}`, '_blank')
}

// Report Logic
const showReportModal = ref(false)
const reportReason = ref('')
const reportType = ref('')
const selectedReasons = ref<string[]>([])

const openReport = (type: string) => {
  reportType.value = type
  reportReason.value = ''
  selectedReasons.value = []
  showReportModal.value = true
}

const submitReport = () => {
  if (selectedReasons.value.length === 0) return
  if (selectedReasons.value.includes('其他') && !reportReason.value.trim()) return

  // Create notification message for the successful report
  const targetName = reportType.value === 'question' ? `问题：${question.value.title}` : `某个回答`
  const reasonText = selectedReasons.value.filter(r => r !== '其他').join('、') + (selectedReasons.value.includes('其他') ? (selectedReasons.value.length > 1 ? '、' : '') + reportReason.value : '')
  
  addNotification({
    id: Date.now(),
    type: 'system',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=System',
    sender: '系统通知',
    action: '举报受理回执',
    content: `您对 "${targetName}" 的举报已提交（举报类型：${reasonText}）。我们会尽快核实处理，感谢您共同维护社区环境！`,
    target: '',
    time: '刚刚',
    isRead: false
  })

  alert('举报已成功提交，感谢您的反馈，工作人员将尽快处理！')
  showReportModal.value = false
}
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
            <button @click="openShare" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              分享
            </button>
            <button 
              @click="toggleCollect"
               class="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors"
              :class="hasCollected ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-100 hover:text-amber-500'"
            >
              <svg class="w-4 h-4" :fill="hasCollected ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {{ hasCollected ? '已收藏' : '收藏' }}
            </button>
            <button @click="openReport('question')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" /></svg>
              举报
            </button>
            <button v-if="question.isAuthor" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-blue-600">
              编辑
            </button>
            <button v-if="question.isAuthor" @click="doDeleteQuestion" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              删除
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
              <button @click="openShare" class="flex items-center gap-1 hover:text-slate-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                分享
              </button>
              <button @click="openReport('answer')" class="flex items-center gap-1 hover:text-slate-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" /></svg>
                举报
              </button>
              <button 
                v-if="answer.author.name === profileName"
                @click="doDeleteAnswer(answer.id)"
                class="flex items-center gap-1 hover:text-red-500 transition-colors ml-auto text-red-400"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                删除
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
                    <button 
                      v-if="comment.author.name === profileName"
                      @click="deleteComment(answer, comment.id)"
                      class="text-[11px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-auto sm:ml-2 focus:opacity-100 cursor-pointer"
                    >
                      删除
                    </button>
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

    <!-- Share Modal -->
    <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all" @click.self="showShareModal = false">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-fade-in relative transition-all">
        <button @click="showShareModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 class="text-lg font-bold text-gray-900 mb-6 text-center">分享给好友</h3>
        
        <div class="flex justify-center gap-10 mb-2">
          <!-- WeChat -->
          <button @click="handleShareWeChat" class="group flex flex-col items-center gap-2 focus:outline-none focus:scale-95 transition-transform">
            <div class="w-14 h-14 bg-[#07C160] rounded-full flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8.25 3.5C4.246 3.5 1 6.183 1 9.493c0 1.83.955 3.42 2.457 4.542l-.76 2.373a.473.473 0 00.597.59l2.482-.937c.725.228 1.503.35 2.302.35.438 0 .864-.04 1.275-.118-.1-.41-.157-.833-.157-1.272 0-3.593 3.565-6.505 7.962-6.505.787 0 1.545.093 2.261.265C18.618 5.762 13.985 3.5 8.25 3.5zm7.304 6.002c-3.864 0-6.993 2.652-6.993 5.925S11.69 21.352 15.554 21.352c.677 0 1.332-.095 1.944-.27l2.093.812a.406.406 0 00.514-.5l-.654-2.06c1.288-.95 2.103-2.316 2.103-3.856 0-3.273-3.129-5.925-6.993-5.925zm-2.072 3.654a.8.8 0 110-1.6.8.8 0 010 1.6zm4.143 0a.8.8 0 110-1.6.8.8 0 010 1.6zM6.55 7.5a.8.8 0 110-1.6.8.8 0 010 1.6zm3.3 0a.8.8 0 110-1.6.8.8 0 010 1.6z"/></svg>
            </div>
            <span class="text-xs text-gray-500 font-medium group-hover:text-gray-900 transition-colors">微信</span>
          </button>
          
          <!-- QQ -->
          <button @click="handleShareQQ" class="group flex flex-col items-center gap-2 focus:outline-none focus:scale-95 transition-transform">
            <div class="w-14 h-14 bg-[#12B7F5] rounded-full flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 448 512"><path d="M433.754 420.445c-11.526 1.393-44.86-52.741-44.86-52.741 0 31.345-16.136 72.247-51.051 101.786 16.842 5.192 54.843 19.167 45.803 34.421-7.316 12.343-125.51 7.881-159.632 4.037-34.122 3.844-152.316 8.306-159.632-4.037-9.045-15.25 28.918-29.214 45.783-34.415-34.92-29.539-51.059-70.445-51.059-101.792 0 0-33.334 54.134-44.859 52.741-5.37-.65-12.424-29.644 9.347-99.704 10.261-33.024 21.995-60.478 40.144-105.779C60.683 98.063 108.982.006 224 0c113.737.006 163.156 96.133 160.264 214.963 18.118 45.223 29.912 72.85 40.144 105.778 21.768 70.06 14.716 99.053 9.346 99.704z"/></svg>
            </div>
            <span class="text-xs text-gray-500 font-medium group-hover:text-gray-900 transition-colors">QQ</span>
          </button>
        </div>

        <!-- WeChat QR Code -->
        <div v-if="wechatQrCodeVisible" class="mt-5 pt-5 border-t border-gray-100 flex flex-col items-center animate-fade-in">
          <p class="text-xs text-slate-500 mb-3">打开微信，使用“扫一扫”分享</p>
          <div class="relative bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${currentShareUrl.replace(/#/g, '%23')}`" class="w-36 h-36 border border-gray-50" />
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm bg-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all" @click.self="showReportModal = false">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fade-in relative transition-all">
        <button @click="showReportModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 class="text-lg font-bold text-gray-900 mb-2">举报内容</h3>
        <p class="text-sm text-gray-500 mb-5">请选择您要举报的问题类型（可多选），我们将尽快处理。</p>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 mb-4">
          <label v-for="reason in ['垃圾广告', '涉黄信息', '人身攻击', '违法犯罪', '不实信息', '其他']" :key="reason" class="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              :value="reason" 
              v-model="selectedReasons" 
              class="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500/30 transition-colors" 
            />
            <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ reason }}</span>
          </label>
        </div>

        <div v-if="selectedReasons.includes('其他')" class="animate-fade-in">
          <textarea 
            v-model="reportReason"
            rows="3" 
            placeholder="请详细描述具体的举报理由..." 
            class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none bg-slate-50 placeholder-slate-400 mt-2"
          ></textarea>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="showReportModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">取消</button>
          <button 
            @click="submitReport"
            :disabled="selectedReasons.length === 0 || (selectedReasons.includes('其他') && !reportReason.trim())"
            class="px-6 py-2 text-sm bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-500/30"
          >
            提交举报
          </button>
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
