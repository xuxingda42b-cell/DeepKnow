import { defineComponent, type PropType } from 'vue'
import { RouterLink } from 'vue-router'
import type { Article } from '../store/articles'

export const ArticleItem = defineComponent({
  name: 'ArticleItem',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true
    }
  },
  setup(props) {
    const timeAgo = (dateStr: string) => {
      if (!dateStr) return dateStr
      const date = new Date(dateStr.replace(/-/g, '/'))
      if (isNaN(date.getTime())) return dateStr
      const diff = Date.now() - date.getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return '刚刚'
      if (mins < 60) return `${mins} 分钟前`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours} 小时前`
      const days = Math.floor(hours / 24)
      if (days < 30) return `${days} 天前`
      return `${Math.floor(days / 30)} 个月前`
    }

    return () => {
      const { article } = props
      return (
        <RouterLink
          to={`/article/${article.id}`}
          class="block p-4 bg-white hover:bg-indigo-50/30 transition-colors border-b border-gray-100 last:border-0 group cursor-pointer"
        >
          {/* Header */}
          <div class="flex items-center text-xs text-gray-500 mb-2 gap-2">
            <span class="font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              文章
            </span>
            <span class="text-gray-300">•</span>
            <div class="flex items-center hover:text-gray-700 transition-colors cursor-pointer">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                class="w-4 h-4 rounded-full mr-1.5 object-cover"
                loading="lazy"
              />
              <span class="truncate">{article.author.name}</span>
            </div>
            <span class="text-gray-300">•</span>
            <span>{timeAgo(article.createdAt)}</span>
          </div>

          {/* Title */}
          <h2 class="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
            {article.title}
          </h2>

          {/* Summary */}
          {article.summary && (
            <p class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          )}

          {/* Footer */}
          <div class="flex items-center justify-between text-xs mt-3">
            {/* Tags */}
            <div class="flex flex-wrap gap-1.5">
              {article.tags.map(tag => (
                <span key={tag} class="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600">
                  {tag}
                </span>
              ))}
            </div>
            {/* Stats */}
            <div class="flex items-center text-gray-500 gap-4 shrink-0">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>{article.viewsCount} 阅读</span>
              </div>
            </div>
          </div>
        </RouterLink>
      )
    }
  }
})
