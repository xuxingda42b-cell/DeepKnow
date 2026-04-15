import { ref, watch } from 'vue'
import { myQuestions } from './questions'

export interface Comment {
  id: number
  author: { name: string; avatar: string }
  content: string
  createdAt: string
  likes?: number
  userLiked?: boolean
  userDisliked?: boolean
}

export interface Answer {
  id: number
  questionId: string
  author: { name: string; avatar: string }
  content: string
  points: number
  isAccepted: boolean
  createdAt: string
  userVoted: number
  comments: Comment[]
}

// Initial mock answers data (for the first mock question)
export const initialAnswers: Answer[] = [
  {
    id: 1,
    questionId: '1',
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
    ]
  },
  {
    id: 2,
    questionId: '1',
    author: { name: '全栈修理工', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jack&scale=200' },
    content: '<p>同意楼上。如果你担心热更新或者 SSR 的单例污染，建议包装在函数中并在 App 级别 provide：</p><pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code class="language-ts">export function createStore() {\\n  return reactive({ count: 0 })\\n}</code></pre>',
    points: 42,
    isAccepted: false,
    createdAt: '2026-04-10 12:15:00',
    userVoted: 0,
    comments: []
  },
  {
    id: 3,
    questionId: '1',
    author: { name: 'CtrlC_CtrlV', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob&scale=200' },
    content: '<p>直接用 Pinia 啊，何必自己造轮子呢，性能优化和 TS 推导官方都帮你做好了。直接用 Pinia 啊，何必自己造轮子呢，性能优化和 TS 推导官方都帮你做好了。</p>',
    points: -2,
    isAccepted: false,
    createdAt: '2026-04-10 14:00:00',
    userVoted: -1,
    comments: []
  }
]

// Load from localStorage or mock data
const savedAnswers = localStorage.getItem('user_answers')
const allAnswersData: Answer[] = savedAnswers ? JSON.parse(savedAnswers) : initialAnswers

export const allAnswers = ref<Answer[]>(allAnswersData)

// Save to localStorage whenever it changes
watch(allAnswers, (newVal) => {
  localStorage.setItem('user_answers', JSON.stringify(newVal))
}, { deep: true })

export const getAnswersByQuestionId = (questionId: string) => {
  return allAnswers.value.filter(a => a.questionId === String(questionId))
}

export const submitAnswerToStore = (answer: Answer) => {
  allAnswers.value.push(answer)
  const q = myQuestions.value.find(q => String(q.id) === String(answer.questionId))
  if (q) {
    q.answersCount++
  }
}

export const updateAnswer = (updatedAnswer: Answer) => {
  const index = allAnswers.value.findIndex(a => a.id === updatedAnswer.id)
  if (index !== -1) {
    allAnswers.value[index] = updatedAnswer
  }
}

export const deleteAnswer = (answerId: number) => {
  const answer = allAnswers.value.find(a => a.id === answerId)
  if (answer) {
    const q = myQuestions.value.find(q => String(q.id) === String(answer.questionId))
    if (q) {
      q.answersCount = Math.max(0, q.answersCount - 1)
    }
  }
  allAnswers.value = allAnswers.value.filter(a => a.id !== answerId)
}

