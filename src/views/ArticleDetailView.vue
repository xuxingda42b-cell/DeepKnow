<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as DOMPurifyPkg from 'dompurify'
import { getArticleById, deleteArticle, incrementArticleViews, type ArticleComment } from '../store/articles'
import { isCollected, addCollection, removeCollection } from '../store/collections'
import { addNotification } from '../store/notifications'
import { ThumbsUp, ThumbsDown } from 'lucide-vue-next'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Marked } from 'marked'

const markedInstance = new Marked()

markedInstance.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code, ['javascript', 'typescript', 'html', 'css', 'python', 'java', 'c++']).value
  }
}))

const DOMPurify = DOMPurifyPkg.default || DOMPurifyPkg

const parseMarkdown = (raw: string) => {
  if (!raw) return ''
  const withMentions = raw.replace(/(^|\s)(@[^\s]+)/g, '$1<a href="/profile" class="mention-link">$2</a>')
  return DOMPurify.sanitize(markedInstance.parse(withMentions, { breaks: true, gfm: true }) as string, { ADD_ATTR: ['class', 'target'] })
}
const route = useRoute()
const router = useRouter()
const articleId = route.params.id as string

const savedProfile = localStorage.getItem('profile_data')
const profileName = savedProfile ? JSON.parse(savedProfile).name || '我' : '我'

const article = computed(() => getArticleById(articleId))

if (article.value) {
  incrementArticleViews(articleId)
}

// We don't need parsedContent anymore since we use parseMarkdown inside the template

const formatDate = (str: string) => str.slice(0, 16)

const doDelete = () => {
  ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复。', '删除文章', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteArticle(articleId)
    router.push('/')
  }).catch(() => {})
}

// Collection state
const hasCollected = computed(() => isCollected(articleId, 'article'))

const toggleCollect = () => {
  if (!article.value) return
  if (hasCollected.value) {
    removeCollection(articleId, 'article')
  } else {
    const plainText = article.value.content.replace(/<[^>]*>?/gm, '').trim()
    addCollection({
      id: articleId,
      type: 'article',
      title: article.value.title,
      summary: plainText.slice(0, 120) + (plainText.length > 120 ? '...' : ''),
      tags: article.value.tags,
      author: article.value.author.name,
      authorAvatar: article.value.author.avatar,
      stats: `${article.value.viewsCount} 阅读`,
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
  const title = encodeURIComponent(article.value?.title || '')
  const url = encodeURIComponent(currentShareUrl.value)
  window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&summary=${encodeURIComponent('来看看这篇好文章')}`, '_blank')
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

  const targetName = `文章：${article.value?.title || ''}`
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

  ElMessage.success('举报已提交，感谢您的反馈！')
  showReportModal.value = false
}

// Comments Logic
const commentInput = ref('')

const submitComment = () => {
  if (!commentInput.value.trim() || !article.value) return
  
  if (!article.value.comments) {
    article.value.comments = []
  }

  const pad = (n: number) => n.toString().padStart(2, '0')
  const now = new Date()
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  article.value.comments.push({
    id: String(Date.now()),
    author: { 
      name: profileName, 
      avatar: savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' : 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' 
    },
    content: commentInput.value,
    likes: 0,
    userLiked: false,
    userDisliked: false,
    createdAt
  })

  addNotification({
    id: Date.now() + 1,
    type: 'mentions',
    avatar: savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' : 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200',
    sender: profileName,
    action: '评论了你的文章',
    content: commentInput.value,
    target: article.value.title.slice(0, 30) + (article.value.title.length > 30 ? '...' : ''),
    time: '刚刚',
    isRead: false
  })

  commentInput.value = ''
}

const deleteComment = (commentId: string) => {
  if (!article.value || !article.value.comments) return
  ElMessageBox.confirm('确定要删除这条评论吗？', '删除评论', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    article.value!.comments = article.value!.comments!.filter(c => String(c.id) !== String(commentId))
    ElMessage.success('评论已删除')
  }).catch(() => {})
}

const handleCommentLike = (comment: ArticleComment) => {
  if (comment.likes === undefined) {
    comment.likes = 0
    comment.userLiked = false
  }
  if (comment.userLiked) {
    comment.likes = (comment.likes ?? 1) - 1
    comment.userLiked = false
  } else {
    comment.likes = (comment.likes ?? 0) + 1
    comment.userLiked = true
    if (comment.userDisliked) {
      comment.userDisliked = false
    }
  }
}

const handleCommentDislike = (comment: ArticleComment) => {
  if (comment.userDisliked) {
    comment.userDisliked = false
  } else {
    comment.userDisliked = true
    if (comment.userLiked) {
      comment.likes = (comment.likes ?? 1) - 1
      comment.userLiked = false
    }
  }
}

const replyToComment = (authorName: string) => {
  const currentText = commentInput.value || ''
  commentInput.value = currentText ? `${currentText} @${authorName} ` : `@${authorName} `
  nextTick(() => {
    const input = document.getElementById('article-comment-input')
    if (input) input.focus()
  })
}



const handleMarkdownClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const link = target.closest('a[href="/profile"]')
  if (link) {
    e.preventDefault()
    router.push('/profile')
  }
}
</script>

<template>
  <div class="animate-fade-in w-full pb-20">
    <!-- Not found -->
    <div v-if="!article" class="w-full mx-auto px-4 py-20 text-center text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg font-medium">文章不存在或已被删除</p>
      <router-link to="/" class="mt-4 inline-block text-blue-600 hover:underline text-sm">返回首页</router-link>
    </div>

    <template v-else>
      <!-- Article Header -->
      <div class="bg-white border-b border-gray-200 shadow-sm px-4 py-10 sm:px-8 mb-8">
        <div class="w-full mx-auto">
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
            <!-- Author actions & Collect -->
            <div class="flex items-center gap-2 mt-4 sm:mt-0">
              <button @click="openShare" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                分享
              </button>
              <button @click="openReport('article')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" /></svg>
                举报
              </button>

              <button 
                @click="toggleCollect"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm"
                :class="hasCollected ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border border-amber-100' : 'text-gray-500 hover:bg-gray-100 hover:text-amber-500 border border-gray-200'"
              >
                <svg class="w-4 h-4" :fill="hasCollected ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {{ hasCollected ? '已收藏' : '收藏' }}
              </button>

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
      </div>

      <!-- Article Body -->
      <div class="w-full mx-auto px-4 sm:px-8 mb-8">
        <div
          class="bg-white rounded-xl border border-gray-100 shadow-sm px-6 sm:px-10 py-8 prose max-w-none text-slate-800 leading-relaxed text-[15px] break-words article-prose"
          v-html="parseMarkdown(article.content)"
          @click="handleMarkdownClick"
        ></div>
      </div>

      <!-- Comments Section -->
      <div class="w-full mx-auto px-4 sm:px-8">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6">{{ article.comments?.length || 0 }} 条评论</h2>

          <!-- Input Area -->
          <div class="flex gap-3 mb-8">
            <img :src="savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200' : 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&scale=200'" class="w-10 h-10 rounded-full border border-gray-100 shrink-0 object-cover" />
            <div class="flex-1 flex flex-col items-end gap-3">
              <textarea
                id="article-comment-input"
                v-model="commentInput"
                rows="3"
                placeholder="参与讨论...（支持 Markdown）"
                class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none bg-slate-50"
              ></textarea>
              <button 
                @click="submitComment"
                :disabled="!commentInput.trim()"
                class="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                发表评论
              </button>
            </div>
          </div>

          <!-- Comment List -->
          <ul v-if="article.comments?.length" class="space-y-6">
            <li v-for="comment in article.comments" :key="comment.id" class="flex gap-4 group">
              <img :src="comment.author.avatar" class="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 flex-shrink-0 object-cover" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-slate-700">{{ comment.author.name }}</span>
                  <span class="text-xs text-slate-400">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div 
                  class="text-sm text-slate-600 article-comment-prose leading-relaxed pt-1" 
                  v-html="parseMarkdown(comment.content)"
                  @click="handleMarkdownClick"
                ></div>
                <div class="mt-2 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <button @click="replyToComment(comment.author.name)" class="text-xs text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">回复</button>
                    <button v-if="comment.author.name === profileName" @click="deleteComment(comment.id)" class="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">删除</button>
                  </div>
                  <div class="flex items-center gap-3">
                    <button 
                      @click="handleCommentLike(comment)"
                      class="flex items-center gap-1 text-[11px] transition-colors"
                      :class="comment.userLiked ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'"
                    >
                      <ThumbsUp class="w-3.5 h-3.5" :class="comment.userLiked ? 'fill-current' : ''" />
                      <span v-if="comment.likes && comment.likes > 0" class="select-none">{{ comment.likes }}</span>
                    </button>
                    <!-- 踩 (无数量展示) -->
                    <button 
                      @click="handleCommentDislike(comment)"
                      class="flex items-center gap-1 text-[11px] transition-colors"
                      :class="comment.userDisliked ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'"
                    >
                      <ThumbsDown class="w-3.5 h-3.5" :class="comment.userDisliked ? 'fill-current' : ''" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

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

/* 评论富文本渲染样式 */
:deep(.article-comment-prose) p {
  margin: 0.25rem 0;
  line-height: 1.5;
}
:deep(.article-comment-prose) p:first-child {
  margin-top: 0;
}
:deep(.article-comment-prose) p:last-child {
  margin-bottom: 0;
}
:deep(.article-comment-prose) code {
  font-size: 0.72rem;
  padding: 1px 4px;
  background: #f1f5f9;
  border-radius: 3px;
  color: #ec4899;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
:deep(.article-comment-prose) pre {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  overflow-x: auto;
  margin: 0.4rem 0;
  font-size: 0.72rem;
}
:deep(.article-comment-prose) pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
}
:deep(.article-comment-prose) strong {
  font-weight: 600;
  color: #334155;
}
:deep(.article-comment-prose) em {
  font-style: italic;
}
:deep(.article-comment-prose) a {
  color: #3b82f6;
  text-decoration: underline;
}
:deep(.article-comment-prose) a.mention-link, :deep(.article-prose) a.mention-link {
  color: #3b82f6 !important;
  text-decoration: none !important;
  font-weight: 500 !important;
  cursor: pointer !important;
}
:deep(.article-comment-prose) blockquote {
  border-left: 3px solid #93c5fd;
  padding-left: 0.6rem;
  margin: 0.3rem 0;
  color: #64748b;
  font-style: italic;
}
:deep(.article-comment-prose) ul, :deep(.article-comment-prose) ol {
  padding-left: 1.2rem;
  margin: 0.25rem 0;
}
:deep(.article-comment-prose) li {
  margin: 0.1rem 0;
}
</style>
