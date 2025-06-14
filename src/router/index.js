import {createRouter, createWebHistory} from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import SignUp from '../views/SignUp.vue';
import GetUser from '../views/GetUser.vue';
import ChatRoom from "../views/ChatRoom.vue";

const routes = [
    {
        path: '/home',
        name: 'home',
        component: Home,
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
    {
        path: '/chatrooms/:roomId',
        name: 'chatroomRoomId',
        component: ChatRoom
    },
    {
        path: '/chatrooms',
        name: 'chatroom',
        component: ChatRoom
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
