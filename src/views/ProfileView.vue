<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 头图背景 -->
      <div class="h-32 bg-gradient-to-r from-blue-500 to-blue-400"></div>
      
      <!-- 用户信息区 -->
      <div class="px-8 pb-8 relative">
        <div class="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-16 mb-6 gap-4">
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
              alt="User Avatar" 
              class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md bg-gray-50 object-cover"
            />
            <div class="text-center sm:text-left mb-2">
              <h1 class="text-2xl font-bold text-gray-900">管理员</h1>
              <p class="text-gray-500 text-sm mt-1">这个人很懒，什么都没有留下。</p>
            </div>
          </div>
          
          <router-link to="/profile/edit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-sm text-sm inline-block">
            编辑资料
          </router-link>
        </div>

        <!-- 统计数据 -->
        <div class="flex justify-center sm:justify-start gap-6 sm:gap-8 py-4 border-y border-gray-100 mb-8 flex-wrap">
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">42</div>
            <div class="text-xs text-gray-500 mt-1">提问</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">128</div>
            <div class="text-xs text-gray-500 mt-1">回答</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">1k+</div>
            <div class="text-xs text-gray-500 mt-1">获赞</div>
          </div>
          <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
            <div class="text-xl font-bold text-gray-900">256</div>
            <div class="text-xs text-gray-500 mt-1">关注</div>
          </div>
          <div class="text-center cursor-pointer hover:opacity-80 transition-opacity">
            <div class="text-xl font-bold text-gray-900">12.5k</div>
            <div class="text-xs text-gray-500 mt-1">粉丝</div>
          </div>
        </div>

        <!-- 标签页与内容 -->
        <div>
          <div class="flex gap-6 border-b border-gray-100">
            <button class="pb-3 text-blue-600 border-b-2 border-blue-600 font-medium text-sm transition-colors">
              最近动态
            </button>
            <button class="pb-3 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
              我的提问
            </button>
            <button class="pb-3 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
              我的回答
            </button>
          </div>
          
          <div class="py-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center">
            <svg class="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            暂无动态数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 可以在这里获取并展示该用户的详细数据
</script>
