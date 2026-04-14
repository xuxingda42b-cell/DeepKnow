import { ref, watch } from 'vue'

export interface Question {
  id: string
  title: string
  description: string
  tags: { name: string; color: string }[]
  author: {
    name: string
    avatar: string
  }
  time: string
  category: string
  answersCount: number
  viewsCount: number
  isResolved: boolean
}

import { questionsData } from '../data/questions'

// Load from localStorage or mock data
const savedQuestions = localStorage.getItem('user_questions')
const initialQuestions = savedQuestions ? JSON.parse(savedQuestions) : questionsData

export const myQuestions = ref<Question[]>(initialQuestions)

// Save to localStorage whenever it changes
watch(myQuestions, (newVal) => {
  localStorage.setItem('user_questions', JSON.stringify(newVal))
}, { deep: true })

export const addQuestion = (q: Question) => {
  myQuestions.value.unshift(q)
}

export const deleteQuestion = (id: string) => {
  myQuestions.value = myQuestions.value.filter(q => q.id !== id)
}
