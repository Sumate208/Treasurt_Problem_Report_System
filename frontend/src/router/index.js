import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'HomePage',
    meta: { login: true },
    component: () => import('../views/Home.vue')
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignUp.vue')
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    meta: { login: true },
    component: () => import('../views/Profile.vue')
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
]

const router = new VueRouter({
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
