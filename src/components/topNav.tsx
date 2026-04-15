import { defineComponent, ref, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { isLoggedIn, logout } from '../store/user'
import { hasGlobalUnread } from '../store/notifications'
import { ElMessageBox, ElMessage } from 'element-plus'

export const TopNav = defineComponent({
  name: 'TopNav',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const searchQuery = ref((route.query.q as string) || '')
    watch(() => route.query.q, (newQ) => {
      searchQuery.value = (newQ as string) || ''
    })

    const handleSearch = () => {
      const q = searchQuery.value.trim()
      if (q) {
        router.push({ path: '/', query: { q } })
      } else {
        router.push({ path: '/' })
      }
    }

    const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')

    const updateAvatar = () => {
      const savedData = localStorage.getItem('profile_data')
      if (savedData) {
        try {
          avatarUrl.value = JSON.parse(savedData).avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        } catch (e) {
          console.error('Failed to parse profile data:', e)
        }
      }
    }

    updateAvatar()

    const avatarMenuOpen = ref(false)

    watch(() => route.path, () => {
      updateAvatar()
      avatarMenuOpen.value = false
    })

    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        logout()
        router.push('/')
        ElMessage.success('已退出登录')
      }).catch(() => { })
    }

    return () => (
      <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div class="w-full px-6 h-14 flex items-center justify-between">
          {/* Logo / Brand & Nav Links */}
          <div class="flex items-center gap-4 sm:gap-8">
            <RouterLink to="/" class="flex items-center gap-2.5 cursor-pointer group">
              <div class="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                <img src="/logo.svg" alt="DeepKnow Logo" class="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div class="flex-col justify-center hidden sm:flex">
                <div class="flex items-baseline gap-1">
                  <span class="text-xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 group-hover:from-blue-600 group-hover:to-indigo-500 transition-all">
                    DeepKnow
                  </span>
                </div>
                <span class="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-0.5 ml-[1px]">知渊问答</span>
              </div>
            </RouterLink>

            {/* Main Navigation */}
            <nav class="flex items-center gap-1">
              <RouterLink
                to="/"
                exactActiveClass="text-blue-700 bg-blue-50 font-semibold"
                class="px-2 sm:px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-[15px] font-medium shrink-0"
              >
                首页
              </RouterLink>
            </nav>
          </div>

          {/* Search Bar */}
          <div class="flex-1 max-w-lg mx-4">
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                v-model={searchQuery.value}
                onKeyup={(e: KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                type="text"
                placeholder="搜索问题、话题或用户... (按回车搜索)"
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div class="flex items-center gap-4 text-sm">
            {isLoggedIn.value ? (
              <>
                <RouterLink
                  to="/ask"
                  class="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-4 py-1.5 rounded-full font-medium transition-colors border border-blue-100"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  提问
                </RouterLink>

                <RouterLink
                  to="/article/write"
                  class="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 px-4 py-1.5 rounded-full font-medium transition-colors border border-indigo-100"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  写文章
                </RouterLink>

                {/* Notifications */}
                <RouterLink to="/messages" class="relative block p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  {hasGlobalUnread.value && <span class="absolute top-1 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </RouterLink>

                {/* Avatar Dropdown */}
                <div class="relative py-2 flex items-center">
                  <img
                    onClick={() => avatarMenuOpen.value = !avatarMenuOpen.value}
                    class="h-8 w-8 rounded-full border border-gray-200 cursor-pointer object-cover hover:ring-2 hover:ring-blue-500 transition-all bg-gray-50 ml-1"
                    src={avatarUrl.value}
                    alt="Admin avatar"
                  />

                  {/* Backdrop for mobile closing */}
                  {avatarMenuOpen.value && (
                    <div class="fixed inset-0 z-40" onClick={() => avatarMenuOpen.value = false}></div>
                  )}

                  {/* Dropdown Menu */}
                  <div class={`absolute right-0 top-[40px] w-32 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-200 transform origin-top-right z-50 ${avatarMenuOpen.value ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                    <div class="py-1.5" onClick={() => avatarMenuOpen.value = false}>
                      <RouterLink to="/" class="block sm:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        返回首页
                      </RouterLink>
                      <RouterLink to="/ask" class="block sm:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        提出问题
                      </RouterLink>
                      <RouterLink to="/article/write" class="block sm:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        写文章
                      </RouterLink>
                      <div class="h-px bg-gray-100 my-1 sm:hidden"></div>

                      <RouterLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        个人主页
                      </RouterLink>
                      <RouterLink to="/messages" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        我的消息
                      </RouterLink>
                      <RouterLink to="/collections" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        我的收藏
                      </RouterLink>
                      <RouterLink to="/drafts" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        我的草稿
                      </RouterLink>
                      <div class="h-px bg-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (

              <div class="flex items-center gap-3 p-1 -mr-1 rounded-full hover:bg-gray-50 transition-colors">
                <RouterLink to="/login" class="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors pl-2">
                  <span class="font-medium">登录</span>
                </RouterLink>
                <span class="text-gray-300">/</span>
                <RouterLink to="/register" class="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors pl-2">
                  <span class="font-medium">注册</span>
                </RouterLink>
                <img
                  class="h-8 w-8 rounded-full border border-gray-200 object-cover hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all bg-gray-50 cursor-pointer"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
                  alt="Guest avatar"
                />
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }
})
