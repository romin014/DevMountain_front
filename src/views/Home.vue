<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import ChatRoomList from './ChatRoomList.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import GuestChatRoom from '@/views/GuestChatRoom.vue'

const username = ref(localStorage.getItem('username') || '익명')
const isGuest = ref(true)
const guestRoomId = ref(null)
const roomId = ref(null)
const ws = ref(null)

const resolvedRoomId = computed(() => {
  return isGuest.value ? guestRoomId.value : roomId.value
})

const handleRoomSelect = (newRoomId) => {
  console.log('새로운 채팅방 선택:', newRoomId)
  roomId.value = newRoomId
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
}

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/users/me', {
      withCredentials: true
    })

    if (!res.data || !res.data.name) throw new Error('비회원')

    username.value = res.data.name
    localStorage.setItem('username', res.data.name)
    isGuest.value = false

    const roomsResponse = await axios.get('http://localhost:8080/chatrooms', {
      withCredentials: true
    })

    if (roomsResponse.data.result && roomsResponse.data.result.length > 0) {
      roomId.value = roomsResponse.data.result[0].chatroomId
      console.log('첫 번째 채팅방 선택:', roomId.value)
    }

  } catch (e) {
    console.log('비회원 모드로 전환:', e)
    isGuest.value = true
    username.value = '익명'
    localStorage.removeItem('username')

    guestRoomId.value = localStorage.getItem('guestRoomId')
    if (!guestRoomId.value) {
      guestRoomId.value = `${Date.now()}${Math.floor(Math.random() * 1000)}`
      localStorage.setItem('guestRoomId', guestRoomId.value)
    }
  }
})

const handleLogout = async () => {
  await axios.post('http://localhost:8080/logout', null, {
    withCredentials: true
  })
  localStorage.removeItem('username')
  location.reload()
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
        <RouterLink v-if="isGuest" to="/users/login" class="nav-link">로그인</RouterLink>
        <RouterLink v-if="isGuest" to="/users/signup" class="nav-link">회원가입</RouterLink>
        <RouterLink v-if="!isGuest" to="/users/me" class="nav-link">내 정보</RouterLink>
        <button
            v-if="!isGuest"
            class="nav-link"
            @click="handleLogout"
        >로그아웃</button>
      </nav>
    </header>

    <main class="main-content">
      <div class="chat-container">
        <ChatRoomList v-if="!isGuest" :onRoomSelect="handleRoomSelect" />

        <!-- 회원/비회원에 따라 컴포넌트 동적으로 선택 -->
        <component
            :is="isGuest ? GuestChatRoom : ChatRoom"
            :username="username"
            :roomId="resolvedRoomId"
            :isGuest="isGuest"
        />
      </div>
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
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.chat-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: stretch;
  height: calc(100vh - 200px); /* 전체 화면 채우기 */
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
