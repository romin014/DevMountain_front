<script setup>
import {ref, onMounted} from 'vue'
import axios from 'axios'
import GuestChatroom from './GuestChatRoom.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import {computed} from 'vue'

const username = ref(localStorage.getItem('username') || '익명')
const isGuest = ref(true)
const guestRoomId = ref(null)
const roomId = ref(null)
const resolvedRoomId = computed(() => {
  return isGuest.value ? guestRoomId.value : roomId.value
})

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/users/me', {
      withCredentials: true
    })

    if (!res.data || !res.data.name) throw new Error('비회원')

    username.value = res.data.name
    localStorage.setItem('username', res.data.name)
    isGuest.value = false

    // ✅ 회원일 경우 채팅방 생성 API 호출
    try {
      const roomRes = await axios.post(
          'http://localhost:8080/chatrooms',
          {name: `${username.value}의 채팅방`},
          {withCredentials: true}
      )
      console.log('채팅방 생성 응답:', roomRes.data)
      
      // 응답 구조 디버깅
      console.log('응답 result 객체:', roomRes.data.result)
      
      if (roomRes.data.result && roomRes.data.result.chatroomId) {
        roomId.value = roomRes.data.result.chatroomId
        console.log('설정된 roomId:', roomId.value)
      } else {
        console.error('채팅방 ID를 찾을 수 없습니다:', roomRes.data)
        throw new Error('채팅방 ID를 찾을 수 없습니다')
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error)
      isGuest.value = true
      username.value = '익명'
      localStorage.removeItem('username')
    }

  } catch (e) {
    // ✅ 게스트일 경우 랜덤 ID 생성 (휘발성)
    isGuest.value = true
    username.value = '익명'
    localStorage.removeItem('username')

    guestRoomId.value = localStorage.getItem('guestRoomId')
    if (!guestRoomId.value) {
      guestRoomId.value = `${Date.now()}${Math.floor(Math.random() * 1000)}`
      localStorage.setItem('guestRoomId', guestRoomId.value)
    }
    // guestRoomId.value = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  }
})
const handleLogout = async () => {
  await axios.post('http://localhost:8080/logout', null, {
    withCredentials: true
  })
  localStorage.removeItem('username')
  location.reload() // 새로고침으로 상태 초기화
}
</script>


<template>
  <div class="wrapper">
    <header class="header">
      <h1 class="logo">🌌 Devmountain</h1>
      <p class="subtext">
        Devmountain은 개발자 성장을 위한 지식과 도구를 제공합니다.
      </p>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">홈</RouterLink>
        <RouterLink v-if="isGuest" to="/users/login" class="nav-link">로그인</RouterLink>
        <button
            v-else
            class="nav-link"
            @click="handleLogout"
        >로그아웃
        </button>
        <RouterLink to="/users/signup" class="nav-link">회원가입</RouterLink>
        <RouterLink to="/users/me" class="nav-link">내 정보</RouterLink>
      </nav>
    </header>

    <main class="main-content">
<!--      <GuestChatroom-->
<!--          v-if="isGuest"-->
<!--          :roomId="resolvedRoomId"-->
<!--          :username="username"-->
<!--      />-->
<!--      <ChatRoom-->
<!--          v-else-->
<!--          :roomId="resolvedRoomId"-->
<!--          :username="username"-->
<!--      />-->
      <ChatRoom
          :username="username"
          :roomId="resolvedRoomId"
          :isGuest="isGuest"
      />


    </main>


  </div>
</template>

<style scoped>
.wrapper {
  background-color: #0e0e0e;
  color: #ffffff;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  width: 100%;
  padding: 24px 0;
  background: #121212;
  border-bottom: 1px solid #2a2a2a;
  text-align: center;
}

.logo {
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12px;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.nav-link {
  color: #00ffff;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.nav-link:hover {
  background-color: #1f1f1f;
}

.main-content {
  padding: 60px 20px;
  max-width: 720px;
  text-align: center;
}

.subtext {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 32px;
  color: #cccccc;
}

.btn-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.primary-btn, .secondary-btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
}

.primary-btn {
  background-color: #00ffff;
  color: #000;
}

.primary-btn:hover {
  background-color: #00e6e6;
}

.secondary-btn {
  background-color: #1e1e1e;
  color: #ffffff;
  border: 1px solid #444;
}

.secondary-btn:hover {
  background-color: #333333;
}

.message-box {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
}

.message {
  font-size: 18px;
  color: #fff;
}
</style>
