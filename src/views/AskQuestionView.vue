<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { questionsData } from '../data/questions'

const router = useRouter()

// Standard progressive form state
const currentStep = ref(1)
const steps = [
  { id: 1, name: '一句话描述你的问题', desc: '提炼核心，让别人愿意点进来' },
  { id: 2, name: '提供问题细节', desc: '描述背景、代码和尝试过的方案' },
  { id: 3, name: '添加标签', desc: '精准分类，召唤相关领域专家' }
]

// Form data
const title = ref('')
const description = ref(`### 预期结果
(描述你期望代码或系统表现出的行为)

### 实际结果
(贴出报错信息或截图描述实际发生的现象)

### 尝试过的方案
(描述你为了解决这个问题已经做了哪些尝试，避免别人重复提供无效建议)
`)
const selectedTags = ref<string[]>([])

// Tags mock
const availableTags = ['Vue.js', 'JavaScript', 'TypeScript', 'Node.js', 'CSS', '前端', '后端', 'React', '服务器', '求职']

// Real-time search logic
const titleFocused = ref(false)
const suggestedQuestions = computed(() => {
  if (!title.value.trim()) return []
  const keyword = title.value.trim().toLowerCase()
  return questionsData.filter(q => q.title.toLowerCase().includes(keyword)).slice(0, 3)
})

// Validation
const isStep1Valid = computed(() => title.value.trim().length >= 5)
const isStep2Valid = computed(() => description.value.trim().replace(/>>>.*?<<</g, '').length > 20)
const isStep3Valid = computed(() => selectedTags.value.length > 0)

const nextStep = () => {
  if (currentStep.value === 1 && !isStep1Valid.value) return
  if (currentStep.value === 2 && !isStep2Valid.value) return
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    if (selectedTags.value.length < 5) {
      selectedTags.value.push(tag)
    }
  }
}

const submitQuestion = () => {
  if (!isStep3Valid.value) return
  // Mock submitting
  alert('问题发布成功！即将跳转到详情页...')
  router.push('/') // Or redirect to fresh detail page
}
</script>

<template>
  <div class="animate-fade-in w-full pb-20 pt-6 px-4 sm:px-6">
    <div class="max-w-3xl mx-auto">
      
      <!-- Page Header -->
      <div class="mb-10 text-center sm:text-left">
        <h1 class="text-3xl font-bold text-slate-800 tracking-tight">提出问题</h1>
        <p class="text-slate-500 mt-2">清晰的表述能帮你更快获得解答，一个好问题往往已经包含了答案的一半。</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        <!-- Sidebar / Steps Indicator -->
        <div class="w-full md:w-64 bg-slate-50 border-r border-gray-100 p-6 md:p-8 shrink-0">
          <ul class="space-y-8 relative">
            <div class="absolute left-3.5 top-5 bottom-5 w-px bg-gray-200 hidden md:block z-0"></div>
            <li v-for="step in steps" :key="step.id" class="relative z-10 flex items-start gap-4">
              <div 
                class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300"
                :class="currentStep === step.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' : (currentStep > step.id ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500')"
              >
                <span v-if="currentStep <= step.id">{{ step.id }}</span>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="pt-0.5">
                <h3 class="font-medium text-slate-900" :class="{'text-blue-600': currentStep === step.id}">{{ step.name }}</h3>
                <p class="text-xs text-slate-500 mt-1 hidden md:block leading-relaxed">{{ step.desc }}</p>
              </div>
            </li>
          </ul>
          
          <div class="mt-10 p-4 bg-amber-50 rounded-lg border border-amber-100 hidden md:block">
            <h4 class="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              提问礼仪
            </h4>
            <ul class="text-[11px] text-amber-700 space-y-1.5 list-disc pl-3">
              <li>提问前请先搜索</li>
              <li>提供足够重现问题的代码</li>
              <li>排版代码，避免截图报错</li>
              <li>保持客气与耐心</li>
            </ul>
          </div>
        </div>

        <!-- Form Content Area -->
        <div class="flex-1 p-6 md:p-8 min-w-0 bg-white">
          
          <!-- Step 1: Title -->
          <div v-show="currentStep === 1" class="animate-fade-in-right">
            <label class="block text-lg font-semibold text-slate-800 mb-2">一句话描述内容</label>
            <p class="text-sm text-slate-500 mb-4">具体、明确的标题能引起更多人的关注。</p>
            
            <div class="relative">
              <input 
                v-model="title"
                @focus="titleFocused = true"
                @blur="setTimeout(() => titleFocused = false, 200)"
                type="text" 
                placeholder="例如：Vue 3 Setup 语法糖中如何动态获取 ref 引用？"
                class="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all transition-colors"
                maxlength="100"
              />
              <div class="absolute right-4 top-3.5 text-xs text-gray-400 font-mono">{{ title.length }}/100</div>

              <!-- Intelligent Search Dropdown -->
              <div v-if="titleFocused && suggestedQuestions.length > 0" class="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/50 overflow-hidden divide-y divide-gray-50">
                <div class="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 border-b border-gray-100">您可能想问的是... (已存在解答)</div>
                <RouterLink 
                  target="_blank"
                  :to="'/question/' + sq.id" 
                  v-for="sq in suggestedQuestions" 
                  :key="sq.id" 
                  class="block px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <h4 class="text-sm font-medium text-blue-600 truncate mb-1">
                    <span v-html="sq.title.replace(new RegExp(title, 'gi'), match => `<mark class='bg-yellow-200 text-slate-900 rounded px-px'>${match}</mark>`)"></span>
                  </h4>
                  <div class="flex items-center text-xs text-slate-500 gap-3">
                    <span>{{ sq.answersCount }} 个回答</span>
                    <span v-if="sq.isResolved" class="text-emerald-500 flex items-center gap-0.5"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>已解决</span>
                  </div>
                </RouterLink>
              </div>
            </div>
            
            <div class="mt-4 text-xs text-red-500 min-h-[16px]">
              <span v-if="title.length > 0 && !isStep1Valid">标题至少需要 5 个字符</span>
            </div>
          </div>

          <!-- Step 2: Details -->
          <div v-show="currentStep === 2" class="animate-fade-in-right">
            <div class="flex items-center justify-between mb-2">
              <label class="text-lg font-semibold text-slate-800">补充详情与上下文</label>
              <button class="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition-colors">切换到预览</button>
            </div>
            <p class="text-sm text-slate-500 mb-4">我已经为你准备好了模板，请尽可能详细地填写！支持 Markdown。</p>

            <div class="border border-blue-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-inner bg-slate-50">
              <textarea 
                v-model="description"
                rows="14"
                class="w-full p-4 bg-transparent outline-none resize-y text-slate-700 font-mono text-sm leading-relaxed"
              ></textarea>
            </div>
             <div class="mt-2 text-xs text-gray-500 min-h-[16px]">
               请不要删除模板的主标题，把你的内容填入标题下方。
             </div>
          </div>

          <!-- Step 3: Tags -->
          <div v-show="currentStep === 3" class="animate-fade-in-right">
            <label class="block text-lg font-semibold text-slate-800 mb-2">添加精准标签</label>
            <p class="text-sm text-slate-500 mb-4">最多选择 5 个相关标签，精准的标签能让提问推送给对的人。</p>
            
            <div class="mb-4">
               <div class="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 border border-gray-200 rounded-xl">
                 <span v-if="selectedTags.length === 0" class="text-sm text-gray-400 py-1 px-2">尚未选择标签...</span>
                 <span 
                   v-for="tag in selectedTags" 
                   :key="tag" 
                   class="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm group"
                 >
                   {{ tag }}
                   <button @click="toggleTag(tag)" class="opacity-50 hover:opacity-100 hover:text-red-600 transition-colors"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                 </span>
               </div>
            </div>

            <div>
              <p class="text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">推荐标签</p>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="tag in availableTags" 
                  :key="tag"
                  @click="toggleTag(tag)"
                  :class="selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'"
                  class="border px-3 py-1.5 rounded-lg text-sm transition-all shadow-sm active:scale-95"
                >
                  + {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Navigation Buttons -->
          <div class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <button 
              @click="prevStep" 
              class="px-5 py-2 rounded-lg text-slate-500 font-medium transition-colors hover:bg-slate-100"
              :class="currentStep === 1 ? 'invisible' : ''"
            >
              上一步
            </button>

            <button 
              v-if="currentStep < 3"
              @click="nextStep"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)"
            >
              下一步，{{ currentStep === 1 ? '填写细节' : '添加标签' }}
            </button>
            <button 
              v-else
              @click="submitQuestion"
              class="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="!isStep3Valid"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              发布问题
            </button>
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
.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
