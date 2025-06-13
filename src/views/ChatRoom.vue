<template>
  <button class="home-box" @click="goHome">Home</button>

  <div class="chatroom">
    <h2>💬 채팅방</h2>

    <div class="chat-messages" ref="chatMessages">
      <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-message', msg.sender === username ? 'from-user' : 'from-other']"
      >
        <div class="message-bubble">
          <span class="sender">{{ msg.sender }}</span>
          <div class="text">{{ msg.text }}</div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="chat-form">
      <input
          v-model="newMessage"
          type="text"
          placeholder="메시지를 입력하세요"
          required
      />
      <button type="submit">전송</button>
    </form>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {useRoute} from 'vue-router'

const username = ref(localStorage.getItem('username') || '익명')

const route = useRoute()
const roomId = route.params.roomId

const socket = ref(null)
const messages = ref([{sender: '시스템', text: '채팅방에 입장했습니다.'}])
const newMessage = ref('')

const connectWebSocket = () => {
  socket.value = new WebSocket(`ws://localhost:8080/ws/chat?roomId=${roomId}`)

  socket.value.onopen = () => {
    console.log('WebSocket 연결 성공')
  }

  socket.value.onmessage = (event) => {
    const data = JSON.parse(event.data)

    // AI 응답만 화면에 출력
    if (data.isAiResponse) {
      messages.value.push({
        sender: '시스템',
        text: data.message
      })
    }

    scrollToBottom()
  }


  socket.value.onclose = () => {
    console.log('WebSocket 연결 종료')
  }

  socket.value.onerror = (error) => {
    console.error('WebSocket 에러:', error)
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !socket.value || socket.value.readyState !== WebSocket.OPEN) return

  const msg = newMessage.value.trim()

  // 내가 보낸 메시지를 즉시 화면에 추가
  messages.value.push({
    sender: username.value,
    text: msg
  })

  socket.value.send(msg)
  newMessage.value = ''
  scrollToBottom()
}


const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.querySelector('.chat-messages')
    if (container) container.scrollTop = container.scrollHeight
  }, 100)
}

onMounted(() => {
  connectWebSocket()
})

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close()
  }
})
</script>

<style>
body {
  background-color: #2f2f31; /* 채팅방보다 10% 밝은 전체 배경 */
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.chatroom {
  max-width: 700px;
  margin: 60px auto;
  padding: 24px;
  background-color: #2c2c2e;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #f2f2f2;
}

.home-box {
  margin-left: 500px;
  margin-top: 40px;
  margin-bottom: -30px;
  background-color: #3a3a3c;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.home-box:hover {
  background-color: #505053;
}

.chatroom h2 {
  text-align: center;
  margin-bottom: 16px;
  color: #f2f2f2;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #1c1c1e;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
}

.message-bubble {
  max-width: 70%;
  padding: 12px;
  border-radius: 12px;
  background-color: #3a3a3c;
  position: relative;
  color: #f2f2f2;
}

.from-user {
  justify-content: flex-end; /* 오른쪽 정렬 */
}

.from-user .message-bubble {
  background-color: #0a84ff;
  color: #fff;
  border-top-right-radius: 0;
}

.from-other {
  justify-content: flex-start; /* 왼쪽 정렬 */
}

.from-other .message-bubble {
  background-color: #3a3a3c;
  color: #f2f2f2;
  border-top-left-radius: 0;
}

.sender {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
  display: block;
  color: #b0b0b0;
}

.text {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.chat-form {
  display: flex;
  gap: 8px;
}

.chat-form input {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #555;
  background-color: #2c2c2e;
  color: #fff;
}

.chat-form button {
  padding: 10px 16px;
  background-color: #0a84ff;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-form button:hover {
  background-color: #0066cc;
}
</style>
