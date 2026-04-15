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
          meta: { title: '首页' }
        },
        {
          path: 'question/:id',
          name: 'question-detail',
          component: () => import('../views/QuestionDetailView.vue'),
          meta: { title: '问题详情' }
        },
        {
          path: 'ask',
          name: 'ask-question',
          component: () => import('../views/AskQuestionView.vue'),
          meta: { title: '提问' }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
          meta: { title: '个人资料' }
        },
        {
          path: 'profile/edit',
          name: 'profile-edit',
          component: () => import('../views/EditProfileView.vue'),
          meta: { title: '编辑资料' }
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('../views/MessagesView.vue'),
          meta: { title: '我的消息' }
        },
        {
          path: 'collections',
          name: 'collections',
          component: () => import('../views/CollectionsView.vue'),
          meta: { title: '我的收藏' }
        },
        {
          path: 'drafts',
          name: 'drafts',
          component: () => import('../views/DraftsView.vue'),
          meta: { title: '我的草稿' }
        },
        {
          path: 'article/write',
          name: 'write-article',
          component: () => import('../views/WriteArticleView.vue'),
          meta: { title: '写文章' }
        },
        {
          path: 'article/edit/:id',
          name: 'edit-article',
          component: () => import('../views/WriteArticleView.vue'),
          meta: { title: '编辑文章' }
        },
        {
          path: 'article/:id',
          name: 'article-detail',
          component: () => import('../views/ArticleDetailView.vue'),
          meta: { title: '文章详情' }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: '注册' }
    }
  ],
})

router.afterEach((to) => {
  const baseTitle = 'DeepKnow 知渊社区'
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${baseTitle}`
  } else {
    document.title = baseTitle
  }
})

export default router
