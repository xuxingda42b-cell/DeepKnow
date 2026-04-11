import { defineComponent, type PropType } from 'vue'
import { RouterLink } from 'vue-router'
import type { Question } from '../data/questions'

export const QuestionItem = defineComponent({
  name: 'QuestionItem',
  props: {
    question: {
      type: Object as PropType<Question>,
      required: true
    }
  },
  setup(props) {
    return () => {
      const { question } = props
      
      return (
        <RouterLink to={`/question/${question.id}`} class="block p-4 bg-white hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 group cursor-pointer">
          {/* Header Metas */}
          <div class="flex items-center text-xs text-gray-500 mb-2 gap-2">
            <span class="font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              {question.category}
            </span>
            <span class="text-gray-300">•</span>
            <div class="flex items-center hover:text-gray-700 transition-colors cursor-pointer">
              <img 
                src={question.author.avatar} 
                alt={question.author.name} 
                class="w-4 h-4 rounded-full mr-1.5 object-cover"
                loading="lazy"
              />
              <span class="truncate">{question.author.name}</span>
            </div>
            <span class="text-gray-300">•</span>
            <span>{question.time}</span>
          </div>

          {/* Title */}
          <h2 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
            {question.title}
          </h2>

          {/* Abstract */}
          {question.description && (
            <p class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {question.description}
            </p>
          )}

          {/* Footer */}
          <div class="flex items-center justify-between text-xs mt-3">
            {/* Tags */}
            <div class="flex flex-wrap gap-1.5">
              {question.tags.map(tag => (
                <span key={tag.name} class={['px-2 py-0.5 rounded-md text-xs font-medium', tag.color]}>
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Status & Stats */}
            <div class="flex items-center text-gray-500 gap-4 shrink-0">
              <div class="flex items-center gap-1.5">
                {question.isResolved ? (
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ) : (
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
                <span class={question.isResolved ? 'text-green-600 font-medium' : ''}>
                  {question.answersCount} 回答
                </span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>{question.viewsCount} 浏览</span>
              </div>
            </div>
          </div>
        </RouterLink>
      )
    }
  }
})
