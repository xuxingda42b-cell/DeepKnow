import { ref, watch } from 'vue'

export interface Draft {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
}

const saved = localStorage.getItem('user_drafts')
export const myDrafts = ref<Draft[]>(saved ? JSON.parse(saved) : [])

watch(myDrafts, (v) => {
  localStorage.setItem('user_drafts', JSON.stringify(v))
}, { deep: true })

export const saveDraft = (draft: Draft) => {
  const index = myDrafts.value.findIndex(d => d.id === draft.id)
  if (index !== -1) {
    myDrafts.value[index] = draft
  } else {
    myDrafts.value.unshift(draft)
  }
}

export const getDraftById = (id: string) => myDrafts.value.find(d => d.id === id)

export const deleteDraft = (id: string) => {
  myDrafts.value = myDrafts.value.filter(d => d.id !== id)
}
