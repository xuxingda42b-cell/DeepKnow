<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as DOMPurifyPkg from 'dompurify'
import { addArticle, getArticleById, updateArticle } from '../store/articles'
import { saveDraft, getDraftById, deleteDraft } from '../store/drafts'
import { ElMessage } from 'element-plus'

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

const router = useRouter()
const route = useRoute()
const savedProfile = localStorage.getItem('profile_data')
const profileName = savedProfile ? JSON.parse(savedProfile).name || '我' : '我'

const isEditing = computed(() => !!route.params.id)
const editId = computed(() => route.params.id as string)
const draftId = computed(() => route.query.draft as string)
const isDraft = computed(() => !!draftId.value)

// If not editing an existing article or draft, we create an ID in case we want to save draft.
const currentDraftId = ref(route.query.draft as string || String(Date.now()))

const title = ref('')
const content = ref(`# 开始写作

在这里输入你的 Markdown 内容，右侧会实时预览渲染结果。

## 支持的语法

- **加粗文字**
- *斜体文字*
- \`行内代码\`

\`\`\`javascript
// 代码块
const hello = 'world'
console.log(hello)
\`\`\`

> 引用块示例

---

### 列表

1. 有序列表项一
2. 有序列表项二

- 无序列表项
- 另一项
`)


const selectedTags = ref<string[]>([])
const tagInput = ref('')
const isSaving = ref(false)

const tagSuggestions = ['前端', '后端', 'Vue.js', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', '算法', '职场']

onMounted(() => {
  if (isEditing.value) {
    const article = getArticleById(editId.value)
    if (article) {
      title.value = article.title
      content.value = article.content
      selectedTags.value = [...article.tags]
    }
  } else if (isDraft.value) {
    const draft = getDraftById(draftId.value)
    if (draft) {
      title.value = draft.title
      content.value = draft.content
      selectedTags.value = [...draft.tags]
    }
  }
})

const parsedContent = computed(() => {
  if (!content.value) return '<p class="text-slate-400 italic">开始输入内容，右侧实时预览...</p>'
  return DOMPurify.sanitize(markedInstance.parse(content.value, { breaks: true, gfm: true }) as string, { ADD_ATTR: ['class', 'target'] })
})

const wordCount = computed(() => content.value.replace(/\s/g, '').length)

const addTag = (tag: string) => {
  const t = tag.trim()
  if (t && !selectedTags.value.includes(t) && selectedTags.value.length < 5) {
    selectedTags.value.push(t)
  }
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

const handleTagInputKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag(tagInput.value)
  }
}

// 工具栏插入 Markdown 辅助
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const insertMarkdown = (prefix: string, suffix = '', placeholder = '文字') => {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = content.value.slice(start, end) || placeholder
  const before = content.value.slice(0, start)
  const after = content.value.slice(end)
  content.value = before + prefix + selected + suffix + after
  // restore cursor after insertion
  setTimeout(() => {
    el.focus()
    const pos = start + prefix.length
    el.setSelectionRange(pos, pos + selected.length)
  }, 0)
}

const isAIOptimizing = ref(false)

const optimizeContentWithAI = () => {
  const el = textareaRef.value
  if (!el) return
  
  const start = el.selectionStart
  const end = el.selectionEnd
  const hasSelection = start !== end
  const textToOptimize = hasSelection ? content.value.slice(start, end) : content.value

  if (!textToOptimize.trim()) {
    ElMessage.warning('内容为空，无法进行 AI 润色')
    return
  }

  isAIOptimizing.value = true
  ElMessage.info({ message: hasSelection ? '✨ AI 正在努力分析选中的段落...' : '✨ AI 正在从头到尾阅读分析你的文章...', duration: 2000 })
  
  setTimeout(() => {
    const aiTips = [
      '\n\n> ✨ **AI 润色批注**：你的段落结构已经梳理得非常清晰。如果后续更新可以通过添加核心的实际代码片段或报错截图，这部分的表达会更具实战气息。',
      '\n\n> ✨ **AI 润色批注**：目前行文流畅度极佳。一个小建议：在讲述复杂的技术难点时，可以适当地将其拆解为多个步骤式的列表，更能降低读者的认知门槛。',
      '\n\n> ✨ **AI 润色批注**：这篇文章显得非常具有专业性。如果能在开篇部分补充一两句关于这项技术的使用场景和背景介绍，将大大帮助初学者更快地代入沉浸状态。'
    ]
    const randomTip = aiTips[Math.floor(Math.random() * aiTips.length)]

    if (hasSelection) {
      const before = content.value.slice(0, start)
      const after = content.value.slice(end)
      const newSelected = textToOptimize + randomTip
      content.value = before + newSelected + after
      
      setTimeout(() => {
        el.focus()
        el.setSelectionRange(start, start + newSelected.length)
      }, 0)
    } else {
      content.value = content.value + randomTip
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 0)
    }

    isAIOptimizing.value = false
    ElMessage.success('🎉 AI 润色完成，请查看批注！')
  }, 2000)
}

const handlePublish = () => {
  if (!title.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!content.value.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }
  isSaving.value = true
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  const now = new Date()
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  
  // 取纯文本摘要
  const plainText = content.value.replace(/#{1,6}\s/g, '').replace(/[*_`~>+\-=|[\]]/g, '').trim()
  const summary = plainText.slice(0, 120) + (plainText.length > 120 ? '...' : '')
  
  if (isEditing.value) {
    updateArticle(editId.value, {
      title: title.value.trim(),
      content: content.value,
      tags: selectedTags.value,
      summary
    })
    deleteDraft(editId.value)
    isSaving.value = false
    router.push(`/article/${editId.value}`)
  } else {
    // If it was loaded from a draft, use its draftId as the article id so it becomes a valid item, 
    // or just generate a new ID if it wasn't. We'll generate a new one unless currentDraftId is used.
    const id = isDraft.value ? draftId.value : currentDraftId.value
    addArticle({
      id,
      title: title.value.trim(),
      content: content.value,
      tags: selectedTags.value,
      author: {
        name: profileName,
        avatar: savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
      },
      createdAt,
      viewsCount: 0,
      summary
    })
    
    deleteDraft(id)
    isSaving.value = false
    router.push(`/article/${id}`)
  }
}

const handleSaveDraft = () => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const now = new Date()
  const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  saveDraft({
    id: isEditing.value ? editId.value : currentDraftId.value,
    title: title.value.trim(),
    content: content.value,
    tags: selectedTags.value,
    updatedAt
  })
  
  ElMessage.success('草稿已保存，可在「头像 → 我的草稿」中查看')
}

const isMobile = ref(false)
const layoutContainer = ref<HTMLElement | null>(null)
const editorSize = ref(50) // percentage

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})

const startDrag = () => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (e.cancelable) e.preventDefault()
  if (!layoutContainer.value) return
  
  const rect = layoutContainer.value.getBoundingClientRect()
  if (isMobile.value) {
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0]?.clientY || 0 : (e as MouseEvent).clientY
    const percentage = ((clientY - rect.top) / rect.height) * 100
    if (percentage > 15 && percentage < 85) editorSize.value = percentage
  } else {
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0]?.clientX || 0 : (e as MouseEvent).clientX
    const percentage = ((clientX - rect.left) / rect.width) * 100
    if (percentage > 15 && percentage < 85) editorSize.value = percentage
  }
}

const stopDrag = () => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-gray-50">
    <!-- Top Bar -->
    <div class="shrink-0 bg-white border-b border-gray-200 px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      <input
        v-model="title"
        type="text"
        placeholder="输入文章标题..."
        class="flex-1 text-lg sm:text-xl font-bold text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none min-w-0"
      />
      <div class="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
        <span class="text-xs text-gray-400 hidden sm:block">{{ wordCount }} 字</span>
        <button
          @click="handleSaveDraft"
          class="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          存草稿
        </button>
        <button
          @click="handlePublish"
          :disabled="isSaving"
          class="px-5 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm whitespace-nowrap"
        >
          {{ isSaving ? (isEditing ? '保存中...' : '发布中...') : (isEditing ? '保存修改' : '发布文章') }}
        </button>
      </div>
    </div>

    <!-- Main Layout (Resizable Stacked or Side-by-side) -->
    <div ref="layoutContainer" class="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden relative">
      <!-- Left/Top: Editor -->
      <div 
        class="flex flex-col bg-white shrink-0 min-h-0 min-w-0"
        :style="{ flexBasis: editorSize + '%', width: isMobile ? '100%' : editorSize + '%', height: isMobile ? editorSize + '%' : '100%' }"
      >
        <!-- Toolbar -->
        <div class="shrink-0 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
          <button @click="insertMarkdown('**', '**', '加粗文字')" title="加粗" class="toolbar-btn">
            <strong class="font-serif text-[13px]">B</strong>
          </button>
          <button @click="insertMarkdown('*', '*', '斜体文字')" title="斜体" class="toolbar-btn">
            <em class="font-serif text-[13px]">I</em>
          </button>
          <button @click="insertMarkdown('~~', '~~', '删除线')" title="删除线" class="toolbar-btn">
            <span class="line-through text-xs">S</span>
          </button>
          <div class="w-px h-4 bg-gray-300 mx-1"></div>
          <button @click="insertMarkdown('# ', '', '一级标题')" title="H1" class="toolbar-btn text-xs font-bold">H1</button>
          <button @click="insertMarkdown('## ', '', '二级标题')" title="H2" class="toolbar-btn text-xs font-bold">H2</button>
          <button @click="insertMarkdown('### ', '', '三级标题')" title="H3" class="toolbar-btn text-xs font-bold">H3</button>
          <div class="w-px h-4 bg-gray-300 mx-1"></div>
          <button @click="insertMarkdown('`', '`', '行内代码')" title="行内代码" class="toolbar-btn">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </button>
          <button @click="insertMarkdown('\n```\n', '\n```\n', '代码块')" title="代码块" class="toolbar-btn">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <button @click="insertMarkdown('> ', '', '引用内容')" title="引用" class="toolbar-btn">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m10 0v12M4 8h16" /></svg>
          </button>
          <button @click="insertMarkdown('\n- ', '', '列表项')" title="无序列表" class="toolbar-btn">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button @click="insertMarkdown('\n---\n', '', '')" title="分割线" class="toolbar-btn">
            <span class="text-xs font-bold">—</span>
          </button>
          <button @click="insertMarkdown('[', '](https://)', '链接文字')" title="链接" class="toolbar-btn">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </button>
          
          <div class="w-px h-4 bg-gray-300 mx-2"></div>
          
          <button 
            @click="optimizeContentWithAI" 
            :disabled="isAIOptimizing"
            class="toolbar-btn text-[12px] font-bold gap-1 !w-auto px-2 disabled:opacity-50 transition-all border border-transparent"
            :class="isAIOptimizing ? 'text-gray-400 cursor-not-allowed' : 'text-fuchsia-600 hover:text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100 hover:border-fuchsia-200'"
            title="AI 一键润色选取段落或全文"
          >
            <svg v-if="isAIOptimizing" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            <span>{{ isAIOptimizing ? 'AI 润色中...' : '智能润色 ✨' }}</span>
          </button>

          <div class="ml-auto text-[11px] text-gray-400 hidden md:block">支持 Markdown 语法</div>
        </div>

        <!-- Tags input -->
        <div class="shrink-0 border-b border-gray-100 px-3 py-2 flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-gray-400 shrink-0">标签：</span>
          <span
            v-for="tag in selectedTags"
            :key="tag"
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
          >
            {{ tag }}
            <button @click="removeTag(tag)" class="hover:text-blue-800 focus:outline-none">×</button>
          </span>
          <input
            v-if="selectedTags.length < 5"
            v-model="tagInput"
            @keydown="handleTagInputKeydown"
            @blur="addTag(tagInput)"
            type="text"
            placeholder="添加标签 (回车确认)"
            class="text-xs border-none outline-none bg-transparent placeholder-gray-300 min-w-24 flex-1"
          />
          <div v-if="tagInput" class="absolute mt-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-1.5 flex flex-wrap gap-1">
            <button
              v-for="s in tagSuggestions.filter(s => s.includes(tagInput) && !selectedTags.includes(s))"
              :key="s"
              @click="addTag(s)"
              class="px-2 py-0.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <textarea
          ref="textareaRef"
          v-model="content"
          placeholder="开始写作... 支持 Markdown 语法"
          class="flex-1 w-full resize-none p-4 text-sm text-slate-700 font-mono leading-relaxed focus:outline-none bg-white placeholder-gray-300"
          spellcheck="false"
        ></textarea>
      </div>

      <!-- Divider for resizing -->
      <div 
        @mousedown="startDrag" 
        @touchstart.passive="startDrag"
        class="flex items-center justify-center shrink-0 bg-gray-100/80 hover:bg-blue-400 active:bg-blue-500 transition-colors z-10 select-none backdrop-blur-sm"
        :class="[isMobile ? 'h-3 cursor-row-resize w-full shadow-inner' : 'w-3 cursor-col-resize h-full shadow-[inset_0_0_2px_rgba(0,0,0,0.1)]']"
      >
        <div class="w-8 h-1 bg-gray-300 rounded-full" v-if="isMobile"></div>
        <div class="h-8 w-1 bg-gray-300 rounded-full" v-else></div>
      </div>

      <!-- Right/Bottom: Preview -->
      <div class="flex flex-col flex-1 min-h-0 min-w-0 bg-white shadow-[0_-4px_6px_-6px_rgba(0,0,0,0.1)] md:shadow-[inset_4px_0_6px_-6px_rgba(0,0,0,0.1)]">
        <div class="shrink-0 px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          <span class="text-xs text-gray-400 font-medium">实时预览</span>
        </div>

        <div class="flex-1 overflow-y-auto px-8 py-6">
          <!-- Article Header Preview -->
          <div v-if="title" class="mb-6 pb-5 border-b border-gray-100">
            <h1 class="text-2xl font-bold text-gray-900 leading-tight mb-3">{{ title }}</h1>
            <div class="flex items-center gap-3 text-sm text-gray-400">
              <img :src="savedProfile ? JSON.parse(savedProfile).avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'" class="w-6 h-6 rounded-full border border-gray-100 bg-gray-50" />
              <span class="font-medium text-gray-600">{{ profileName }}</span>
              <span>·</span>
              <span>{{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
              <span v-if="selectedTags.length" class="flex items-center gap-1 flex-wrap">
                <span
                  v-for="tag in selectedTags"
                  :key="tag"
                  class="px-2 py-0.5 bg-blue-50 text-blue-500 text-xs rounded-full"
                >{{ tag }}</span>
              </span>
            </div>
          </div>

          <!-- Placeholder title -->
          <div v-else class="mb-6 pb-4 border-b border-gray-100">
            <div class="h-7 w-64 bg-gray-100 rounded-md animate-pulse mb-3"></div>
            <div class="h-4 w-40 bg-gray-50 rounded"></div>
          </div>

          <!-- Parsed Markdown Content -->
          <div
            class="prose max-w-none text-slate-800 leading-relaxed text-[15px] break-words"
            v-html="parsedContent"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-btn {
  padding: 0.375rem;
  border-radius: 0.25rem;
  color: #64748b;
  transition: background-color 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
}
.toolbar-btn:hover {
  background: #fff;
  color: #1e293b;
}

:deep(.prose) {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
:deep(.prose) h1 { font-size: 1.6rem; font-weight: 700; margin: 1.2rem 0 0.6rem; color: #1e293b; }
:deep(.prose) h2 { font-size: 1.3rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.3rem; }
:deep(.prose) h3 { font-size: 1.1rem; font-weight: 600; margin: 0.8rem 0 0.4rem; color: #334155; }
:deep(.prose) p { margin: 0.75rem 0; line-height: 1.75; }
:deep(.prose) pre {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
  font-size: 0.85rem;
}
:deep(.prose) code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
}
:deep(.prose) p code, :deep(.prose) li code {
  background: #f1f5f9;
  color: #ec4899;
  padding: 1px 5px;
  border-radius: 4px;
}
:deep(.prose) blockquote {
  border-left: 4px solid #93c5fd;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
  font-style: italic;
  background: #eff6ff;
  border-radius: 0 0.5rem 0.5rem 0;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
:deep(.prose) ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.prose) ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.prose) li { margin: 0.25rem 0; }
:deep(.prose) a { color: #3b82f6; text-decoration: underline; }
:deep(.prose) hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
:deep(.prose) img { max-width: 100%; border-radius: 0.5rem; }
:deep(.prose) table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
:deep(.prose) th { background: #f8fafc; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; font-weight: 600; text-align: left; }
:deep(.prose) td { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; }
:deep(.prose) strong { font-weight: 600; color: #1e293b; }
</style>
