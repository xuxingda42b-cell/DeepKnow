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
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: 'profile/edit',
          name: 'profile-edit',
          component: () => import('../views/EditProfileView.vue'),
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('../views/MessagesView.vue'),
        },
        {
          path: 'collections',
          name: 'collections',
          component: () => import('../views/CollectionsView.vue'),
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    }
  ],
})

export default router
