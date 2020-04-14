import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */


export const constantRoutes = [
  {
    path: '/redirect',
    component: () => import('@/layout'),
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: () => import('@/layout'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  }
]


export const asyncRoutes = [
  {
    path: '/book',
    name: 'book',
    component: () => import('@/layout'),
    redirect:'/book/create',
    meta:{title: '图书管理', icon:'documentation',roles:['admin']},
    children:[
      {
        path:'/book/create',
        name: 'BookCreate',
        component:() => import('@/views/book/Create'),
        meta:{ title:'上传图书', icon:'edit',roles:['admin']}
      },
      {
        path:'/book/edit/:fileName',
        name: 'BookEdit',
        hidden:true,
        component:() => import('@/views/book/Edit'),
        meta:{ title:'编辑图书', icon:'edit',roles:['admin'],activeMenu:'/book/list'}
      },
      {
        path:'/book/list',
        name: 'BookList',
        component:() => import('@/views/book/List'),
        meta:{ title:'图书列表', icon:'list',roles:['admin']}
      }
    ]
  },
  /** when your routing map is too long, you can split it into small modules **/
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()


export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
