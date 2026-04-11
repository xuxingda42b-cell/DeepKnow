import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export const TopNav = defineComponent({
  name: 'TopNav',
  setup() {
    return () => (
      <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo / Brand */}
          <RouterLink to="/" class="flex items-center gap-2">
            <div class="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
              Q&A
            </div>
            <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 hidden sm:block">
              问答社区
            </span>
          </RouterLink>

          {/* Search Bar */}
          <div class="flex-1 max-w-lg mx-4">
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜索问题、话题或用户..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div class="flex items-center gap-4 text-sm">
            <RouterLink 
              to="/ask" 
              class="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-4 py-1.5 rounded-full font-medium transition-colors border border-blue-100"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              提问
            </RouterLink>

            {/* Notifications */}
            <button class="relative p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span class="absolute top-1 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Avatar */}
            <img
              class="h-8 w-8 rounded-full border border-gray-200 cursor-pointer object-cover hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
              alt="User avatar"
            />
          </div>
        </div>
      </header>
    )
  }
})
