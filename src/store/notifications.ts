import { ref, computed } from 'vue'

export const messages = ref([
  {
    id: 1,
    type: 'mentions',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    sender: '路人甲',
    action: '在问题中提到了你',
    content: '我觉得 @管理员 的那个方案更好一些，你们觉得呢？我们可以稍微调整一下。',
    target: '如何使用 Vue 3 组合式 API 写出更优雅的代码？',
    time: '10 分钟前',
    isRead: false
  },
  {
    id: 2,
    type: 'likes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    sender: '热心网友',
    action: '赞了你的回答',
    content: '',
    target: '响应式数据直接修改会造成什么影响？...',
    time: '1 小时前',
    isRead: false
  },
  {
    id: 3,
    type: 'likes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lydia',
    sender: 'Jane Doe',
    action: '赞了你的文章',
    content: '',
    target: '2024 年前端发展趋势解读',
    time: '2 小时前',
    isRead: false
  },
  {
    id: 4,
    type: 'mentions',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    sender: 'Bob Admin',
    action: '回复了你',
    content: '非常感谢你的解答！我现在明白了，原来是 setup 函数的执行时机问题。以后写代码会注意的。',
    target: '我的评论：你可能没注意到生命周期的顺序...',
    time: '昨天 14:20',
    isRead: true
  },
  {
    id: 5,
    type: 'system',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=System',
    sender: '系统通知',
    action: '社区规则更新',
    content: '为了提供更好的交流环境，社区更新了包含友好发帖等的一系列规范，请查收了解。',
    target: '',
    time: '2024-03-21',
    isRead: true
  }
])

export const hasGlobalUnread = computed(() => messages.value.some(m => !m.isRead))

export const markAllAsRead = () => {
  messages.value.forEach(m => m.isRead = true)
}

export const markAsRead = (id: number) => {
  const msg = messages.value.find(m => m.id === id)
  if (msg) {
    msg.isRead = true
  }
}
