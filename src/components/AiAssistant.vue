<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

// 面板显隐状态
const isOpen = ref(false)

const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: '你好！我是 DeepSeek AI 助手。有什么关于编程、技术或问答社区的问题，尽管问我！'
  }
])

const input = ref('')
const isLoading = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  isLoading.value = true
  scrollToBottom()

  const assistantMsg: Message = { role: 'assistant', content: '', streaming: true }
  messages.value.push(assistantMsg)

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages.value
          .slice(0, -1)
          .map(m => ({ role: m.role, content: m.content })),
        stream: true,
        max_tokens: 1024
      })
    })

    if (!response.ok || !response.body) {
      throw new Error(`API 错误: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.replace('data: ', '')
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            assistantMsg.content += delta
            scrollToBottom()
          }
        } catch {}
      }
    }

    assistantMsg.streaming = false
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '请求失败'
    assistantMsg.content = `❌ 抱歉，请求出错：${errorMsg}\n\n请确认 DeepSeek API Key 是否正确配置（在 .env 文件中设置 VITE_DEEPSEEK_API_KEY）。`
    assistantMsg.streaming = false
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const renderContent = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 text-slate-100 p-2 rounded-lg text-xs my-2 overflow-x-auto whitespace-pre-wrap">$1</pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-pink-600 px-1 rounded text-xs">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const hasApiKey = computed(() => apiKey && apiKey !== 'your_deepseek_api_key_here')
</script>

<template>
  <!-- 浮动触发按钮 -->
  <button
    @click="isOpen = !isOpen"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-white"
    :class="isOpen ? 'rotate-0' : ''"
    aria-label="打开 AI 助手"
  >
    <!-- 打开时显示关闭图标，关闭时显示机器人图标 -->
    <svg v-if="!isOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>

    <!-- 未读提示小红点（首次未打开时显示） -->
    <span
      v-if="!isOpen"
      class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"
    ></span>
  </button>

  <!-- 聊天面板：PC 右下角弹出，移动端全屏 -->
  <Transition name="chat-panel">
    <div
      v-if="isOpen"
      class="fixed z-40 flex flex-col bg-white shadow-2xl
             bottom-0 left-0 right-0 top-0
             sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto
             sm:w-[380px] sm:h-[560px] sm:rounded-2xl
             border border-gray-100 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-500 shrink-0">
        <div class="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <div class="text-white font-semibold text-sm">DeepSeek AI 助手</div>
          <div class="text-blue-200 text-xs">智能问答 · 实时流式响应</div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <span class="inline-flex items-center gap-1 text-xs text-blue-200">
            <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            在线
          </span>
          <!-- 移动端关闭按钮 -->
          <button
            @click="isOpen = false"
            class="sm:hidden ml-1 p-1 text-white/70 hover:text-white transition-colors"
            aria-label="关闭"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- No API Key Warning -->
      <div v-if="!hasApiKey" class="mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 shrink-0">
        <div class="font-semibold mb-1">⚠️ 未配置 API Key</div>
        <div>请在项目根目录的 <code class="bg-amber-100 px-1 rounded">.env</code> 文件中设置：</div>
        <code class="block mt-1 bg-amber-100 px-2 py-1 rounded text-xs">VITE_DEEPSEEK_API_KEY=sk-xxx</code>
      </div>

      <!-- Messages -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex gap-2.5"
          :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <!-- Avatar -->
          <div
            class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
            :class="msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'"
          >
            {{ msg.role === 'user' ? '我' : 'AI' }}
          </div>
          <!-- Bubble -->
          <div
            class="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
            :class="msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'"
          >
            <span v-html="renderContent(msg.content)"></span>
            <span v-if="msg.streaming" class="inline-block w-1 h-3.5 bg-blue-500 ml-0.5 animate-pulse rounded-sm align-middle"></span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-gray-100 p-3 shrink-0">
        <div class="flex gap-2 items-end">
          <textarea
            v-model="input"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="输入你的问题... (Enter 发送)"
            rows="2"
            class="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-gray-50 placeholder-gray-400 transition-all"
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="!input.trim() || isLoading"
            class="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 self-end"
          >
            <svg v-if="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div class="text-[10px] text-gray-400 mt-1.5 text-center">由 DeepSeek 提供支持 · Enter 发送 · Shift+Enter 换行</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* PC 端从右下角弹出 */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

/* 移动端全屏从底部滑入（利用媒体查询覆盖） */
@media (max-width: 639px) {
  .chat-panel-enter-from,
  .chat-panel-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}
</style>
