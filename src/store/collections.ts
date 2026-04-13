import { ref, watch } from 'vue'

export interface CollectionItem {
  id: string | number;
  type: 'question' | 'article';
  title: string;
  summary: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  stats: string;
  savedAt: string;
}

// Load from localStorage or initialize empty
const savedCollections = localStorage.getItem('user_collections')
const initialCollections = savedCollections ? JSON.parse(savedCollections) : []

export const myCollections = ref<CollectionItem[]>(initialCollections)

// Save to localStorage whenever it changes
watch(myCollections, (newVal) => {
  localStorage.setItem('user_collections', JSON.stringify(newVal))
}, { deep: true })

export const addCollection = (item: CollectionItem) => {
  // Prevent duplicate
  if (!myCollections.value.find(c => c.id === item.id && c.type === item.type)) {
    // Add to the beginning
    myCollections.value.unshift(item)
  }
}

export const removeCollection = (id: string | number, type: 'question' | 'article') => {
  myCollections.value = myCollections.value.filter(c => !(c.id === id && c.type === type))
}

export const isCollected = (id: string | number, type: 'question' | 'article') => {
  return myCollections.value.some(c => c.id === id && c.type === type)
}
