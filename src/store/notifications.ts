import { ref, computed, watch } from 'vue'

export interface AppNotification {
  id: number
  type: string
  isRead: boolean
  avatar: string
  sender: string
  action: string
  time: string
  content?: string
  target?: string
}

const savedNotifs = localStorage.getItem('user_notifications')

export const messages = ref<AppNotification[]>(savedNotifs ? JSON.parse(savedNotifs) : [])

watch(messages, (newVal) => {
  localStorage.setItem('user_notifications', JSON.stringify(newVal))
}, { deep: true })

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

export const addNotification = (notif: AppNotification) => {
  messages.value.unshift(notif)
}
