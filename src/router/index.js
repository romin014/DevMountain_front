import {createRouter, createWebHistory} from 'vue-router';
import App from '../App.vue';
import Login from '../views/Login.vue';
import SignUp from '../views/SignUp.vue';
import GetUser from '../views/GetUser.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: App,
    },
    {
        path: '/users/signup',
        name: 'signup',
        component: SignUp
    },
    {
        path: '/users/login',
        name: 'login',
        component: Login
    },
    {
        path: '/users/me',
        name: 'profile',
        component: GetUser
    },
    // 404 Not Found 라우트 (가장 마지막에 위치)
    {
        path: '/:catchAll(.*)', // 정의되지 않은 모든 경로
        name: 'notFound',
        component: () => import('../views/NotFoundView.vue') // 404 페이지 컴포넌트
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
