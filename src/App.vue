<script setup lang="ts">
import { RouterView } from 'vue-router'
import AiAssistant from './components/AiAssistant.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
    <AiAssistant />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}
</style>
