<script setup>
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import axios from 'axios'

const message = ref('로딩 중...')
const router = useRouter()
// const username = localStorage.getItem('username') || '익명'
const username = ref(localStorage.getItem('username') || '익명')

const handleStart = async () => {
  console.log('handleStart 실행됨')

  if (isGuest.value) {
    const guestRoomId = `${Date.now()}${Math.floor(Math.random() * 1000)}`
    console.log('비회원 guest room으로 이동:', guestRoomId)
    router.push(`/chatrooms/${guestRoomId}`)
  } else {
    console.log('회원 채팅방 생성 요청 시도')
    try {
      const response = await axios.post(
          'http://localhost:8080/chatrooms',
          {chatroomName: `${username}의 채팅방`},
          {withCredentials: true}
      )
      console.log('채팅방 생성 성공:', response.data)
      const chatroomId = response.data.result.chatroomId
      router.push(`/chatrooms/${chatroomId}`)
    } catch (error) {
      console.error('채팅방 생성 실패:', error.response?.data || error.message)
      alert('채팅방 생성 실패')
    }
  }
}
const isGuest = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/users/me', {
      withCredentials: true
    })
    if (typeof res.data !== 'object' || res.data.name === undefined) {
      throw new Error('비회원 응답입니다.')
    }
    username.value = res.data.name
    isGuest.value = false
    localStorage.setItem('username', res.data.name)
    console.log('로그인 사용자:', username.value)
  } catch (e) {
    isGuest.value = true
    username.value = '익명'
    localStorage.removeItem('username')
    console.log('비회원 사용자로 인식됨')
  }
})


</script>


<template>
  <div class="wrapper">
    <header class="header">
      <h1 class="logo">🌌 Devmountain</h1>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">홈</RouterLink>
        <RouterLink to="/users/login" class="nav-link">로그인</RouterLink>
        <RouterLink to="/users/signup" class="nav-link">회원가입</RouterLink>
        <RouterLink to="/users/me" class="nav-link">내 정보</RouterLink>
      </nav>
    </header>

    <main class="main-content">
      <h2 class="headline">Introducing Devmountain</h2>
      <p class="subtext">
        Devmountain은 개발자 성장을 위한 지식과 도구를 제공합니다.
      </p>
      <div class="btn-group">
        <button class="primary-btn" @click="handleStart">시작하기</button>
        <!--        <RouterLink to="/about" class="secondary-btn">더 알아보기</RouterLink>-->
      </div>

      <!--      <div class="message-box">-->
      <!--        <p class="message">{{ message }}</p>-->
      <!--      </div>-->
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

.headline {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
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
