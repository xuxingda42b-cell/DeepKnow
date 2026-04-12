import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'question/:id',
          name: 'question-detail',
          component: () => import('../views/QuestionDetailView.vue'),
        },
        {
          path: 'ask',
          name: 'ask-question',
          component: () => import('../views/AskQuestionView.vue'),
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    }
  ],
})

export default router
