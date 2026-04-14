import { ref, watch } from 'vue'

export interface Article {
  id: string
  title: string
  content: string        // raw markdown
  tags: string[]
  author: { name: string; avatar: string }
  createdAt: string
  viewsCount: number
  summary: string        // 纯文本摘要（截取前100字）
  comments?: any[]       // 文章评论
}

const saved = localStorage.getItem('user_articles')
export const myArticles = ref<Article[]>(saved ? JSON.parse(saved) : [])

watch(myArticles, (v) => {
  localStorage.setItem('user_articles', JSON.stringify(v))
}, { deep: true })

export const addArticle = (a: Article) => {
  if (!a.comments) a.comments = []
  myArticles.value.unshift(a)
}

export const deleteArticle = (id: string) => {
  myArticles.value = myArticles.value.filter(a => a.id !== id)
}

export const updateArticle = (id: string, partial: Partial<Article>) => {
  const index = myArticles.value.findIndex(a => a.id === id)
  if (index !== -1) {
    myArticles.value[index] = { ...myArticles.value[index], ...partial } as Article
  }
}

export const getArticleById = (id: string) =>
  myArticles.value.find(a => a.id === id)

export const incrementArticleViews = (id: string) => {
  const a = myArticles.value.find(a => a.id === id)
  if (a) a.viewsCount++
}
