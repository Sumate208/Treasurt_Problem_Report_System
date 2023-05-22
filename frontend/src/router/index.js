import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: "/",
    name: "HomePage",
    meta: { login: true },
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignUpPage.vue')
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignInPage.vue')
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    meta: { login: true },
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/sent-problem',
    name: 'SentProblem',
    meta: { login: true },
    component: () => import('../views/problems/SentProblem.vue')
  },
  {
    path: '/history',
    name: 'ProblemHistory',
    meta: { login: true },
    component: () => import('../views/problems/ProblemHistory.vue')
  },
  {
    path: '/problem/:id',
    name: 'ProblemDetail',
    meta: { login: true },
    component: () => import('../views/problems/ProblemDetail.vue')
  },
  {
    path: '/chat',
    name: 'ChatView',
    meta: { login: true },
    component: () => import('../views/ChatPage.vue')
  },
  {
    path: '/test',
    name: 'TestPage',
    component: () => import('../views/TestPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('ts-token')

  if (to.meta.login && !isLoggedIn) {
    alert('Please login first!')
    next({ path: '/signin' })
  }

  if (to.meta.guess && isLoggedIn) {
    alert("You've already logged in")
    next({ path: '/'})
  }

  next()
})

export default router
