import {createRouter, createWebHistory} from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import SignUp from '../views/SignUp.vue';
import GetUser from '../views/GetUser.vue';
import ChatRoom from "../views/ChatRoom.vue";
import GuestChatRoom from "../views/GuestChatRoom.vue";

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
    {
        path: '/guestChatrooms/:roomId',
        name: 'guestChatroomRoomId',
        component: GuestChatRoom
    },
    {
        path: '/guestChatrooms/:roomId',
        name: 'guestChatroom',
        component: GuestChatRoom
    },
    {
        path: '/payment',
        name: 'Payment',
        component: () => import('@/views/Payment.vue')
    },
    {
        path: '/success',
        name: 'Success',
        component: () => import('@/views/Success.vue')
    },
    {
        path: '/fail',
        name: 'Fail',
        component: () => import('@/views/Fail.vue')
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
