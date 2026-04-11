<script setup lang="ts">
import { RouterView } from 'vue-router'
import { TopNav } from '../components/topNav'
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-300">
    <!-- Top Navigation -->
    <TopNav />
    
    <!-- Main Content Area (Level 2 Routes render here) -->
    <div class="flex-1 w-full max-w-5xl mx-auto flex flex-col relative">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
