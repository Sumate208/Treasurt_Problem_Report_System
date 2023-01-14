import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
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
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/sent-report',
    name: 'SentReport',
    component: () => import('../views/reports/SentReport.vue')
  },
  {
    path: '/',
    name: 'ReportView',
    component: () => import('../views/reports/Report.vue')
  },
  {
    path: '/report/:id',
    name: 'ReportDetail',
    component: () => import('../views/reports/ReportDetail.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
