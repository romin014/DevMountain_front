import {createRouter, createWebHistory} from 'vue-router';
// todo : Home.vue 대신 app으로 화면 띄우는 중 -> Home.vue 제작시 수정
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
    // TODO : 채팅방 주소 들어가야함
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
