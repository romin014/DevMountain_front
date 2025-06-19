<script setup>
// Vue의 반응형 변수 및 라이프사이클 훅, axios 등 import
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import ChatRoomList from './ChatRoomList.vue'
import ChatRoom from '@/views/ChatRoom.vue'
import GuestChatRoom from '@/views/GuestChatRoom.vue'

// 사용자 이름(회원/비회원), 게스트 여부, 채팅방 ID 등 상태 변수 선언
const username = ref(localStorage.getItem('username') || '익명') // 사용자 이름(로컬스토리지 우선)
const isGuest = ref(true) // 비회원 여부
const guestRoomId = ref(null) // 비회원 채팅방 ID
const roomId = ref(null) // 회원 채팅방 ID
const ws = ref(null) // WebSocket 객체(예비)
const loginMessage = ref('') // 소셜 로그인 성공 메시지

// 실제로 사용할 채팅방 ID(회원/비회원 구분)
const resolvedRoomId = computed(() => {
  // 비회원이면 guestRoomId, 회원이면 roomId 사용
  return isGuest.value ? guestRoomId.value : roomId.value
})

// 채팅방 선택 시 호출되는 함수(채팅방 ID 갱신 및 WebSocket 정리)
const handleRoomSelect = (newRoomId) => {
  // 채팅방 변경 시 roomId 갱신 및 기존 WebSocket 연결 종료
  console.log('새로운 채팅방 선택:', newRoomId)
  roomId.value = newRoomId
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
}

// 컴포넌트 마운트 시(최초 진입/새로고침) 회원/비회원 판별 및 채팅방 목록 조회
onMounted(async () => {
  // 소셜 로그인 후 리다이렉트된 경우 URL 파라미터로 성공 메시지 표시
  const urlParams = new URLSearchParams(window.location.search)
  const isLoginSuccess = urlParams.get('login') === 'success'
  const message = urlParams.get('message') // 백엔드에서 전달받은 메시지
  
  if (isLoginSuccess) {
    // 소셜 로그인 성공 시 안내 메시지 3초간 표시
    console.log('소셜 로그인 성공 감지, 세션 재확인 중...')
    
    // 백엔드에서 전달받은 메시지가 있으면 표시
    if (message) {
      loginMessage.value = decodeURIComponent(message)
      // 3초 후 메시지 자동 제거
      setTimeout(() => {
        loginMessage.value = ''
      }, 3000)
    }
    // URL 파라미터 제거(새로고침 시 중복 방지)
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  try {
    // 회원 정보 조회(쿠키/세션 기반)
    const res = await axios.get('http://localhost:8080/users/me', {
      withCredentials: true
    })
    console.log('회원 정보 조회 성공:', res.data)
    // name이 null이어도 email/userId가 있으면 회원으로 인식
    if (!res.data || (!res.data.name && !res.data.email && !res.data.userId)) {
      throw new Error('비회원')
    }
    // name이 null이면 email을 이름으로 사용
    username.value = res.data.name || res.data.email || '회원'
    localStorage.setItem('username', username.value)
    isGuest.value = false

    // 회원 채팅방 목록 조회
    const roomsResponse = await axios.get('http://localhost:8080/chatrooms', {
      withCredentials: true
    })
    console.log('채팅방 목록 조회 성공:', roomsResponse.data)
    // 첫 번째 채팅방을 기본 선택(추후 localStorage 연동 가능)
    if (roomsResponse.data.result && roomsResponse.data.result.length > 0) {
      roomId.value = roomsResponse.data.result[0].chatroomId
      console.log('첫 번째 채팅방 선택:', roomId.value)
    }
  } catch (e) {
    // 비회원 모드 진입(회원 정보 조회 실패 시)
    console.log('비회원 모드로 전환:', e)
    isGuest.value = true
    username.value = '익명'
    localStorage.removeItem('username')
    // 비회원 채팅방 ID 생성/복원
    guestRoomId.value = localStorage.getItem('guestRoomId')
    if (!guestRoomId.value) {
      guestRoomId.value = `${Date.now()}${Math.floor(Math.random() * 1000)}`
      localStorage.setItem('guestRoomId', guestRoomId.value)
    }
  }
})

// 로그아웃 처리(세션 종료 및 새로고침)
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
    <!-- 소셜 로그인 성공 메시지 -->
    <div v-if="loginMessage" class="login-success-message">
      {{ loginMessage }}
    </div>
    
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

.login-success-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4CAF50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
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
