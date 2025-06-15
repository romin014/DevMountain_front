<template>
  <div class="chatroom">
    <div class="chat-header">
      <h2>비회원 채팅방</h2>
      <!-- 멤버십 아이콘 -->
      <div class="membership-status">
        <img 
          :src="guestMembershipIcon" 
          alt="비회원" 
          class="membership-icon"
          title="비회원 혜택:
• 기본 채팅 이용 (채팅 횟수 5회 제한)
• 기본 AI 응답 제공

멤버십 업그레이드 시:
• 무제한 채팅 이용
• AI 강의 추천
• 기본 학습 경로 제공"
        />
      </div>
    </div>

    <div class="chat-messages" ref="chatMessages">
      <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-message', msg.sender === guestUsername ? 'from-user' : 'from-other']"
      >
        <div class="message-bubble">
          <div class="message-header">
            <span class="sender">{{ msg.sender }}</span>
          </div>
          <div class="text" style="white-space: pre-wrap;">{{ msg.text }}</div>
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
import {ref, onMounted, onBeforeUnmount, watch} from 'vue'
import axios from 'axios'
import guestMembershipIcon from '@/assets/guest.png'  // 이미지 import

const props = defineProps({
  roomId: String,
  username: String
})

const socket = ref(null)
const messages = ref([{sender: '시스템', text: '채팅방에 입장했습니다.'}])
const newMessage = ref('')
const guestUsername = '익명'  // 비회원 사용자 이름을 고정

const connectWebSocket = () => {
  if (!props.roomId) return

  socket.value = new WebSocket(`ws://localhost:8080/ws/chat?roomId=${props.roomId}`)

  socket.value.onopen = () => console.log('WebSocket 연결 성공')

  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('Received message:', data)

      // message 필드가 JSON 문자열인 경우 파싱
      let messageContent
      try {
        messageContent = JSON.parse(data.message)
      } catch {
        messageContent = null
      }

      // 사용자가 보낸 메시지의 JSON 응답은 무시
      if (messageContent && 
          messageContent.messageType === 'CHAT' && 
          !messageContent.isAiResponse && 
          messageContent.sender === guestUsername) {
        return
      }

      // 메시지 타입에 따라 다르게 처리
      switch (data.messageType) {
        case 'WELCOME':
        case 'CHAT':
        case 'ERROR':
          messages.value.push({
            sender: '시스템',
            text: data.message
          })
          break
        case 'RECOMMENDATION':
          if (data.recommendations && data.recommendations.length > 0) {
            // 추천 강의 목록을 포맷팅하여 표시
            const formattedMessage = data.recommendations.map((rec, index) => 
              `[추천 강의 ${index + 1}]\n${rec.title}\n${rec.description}`
            ).join('\n\n')
            messages.value.push({
              sender: '시스템',
              text: formattedMessage
            })
          }
          break
        default:
          // 기타 메시지 타입은 그대로 표시
          messages.value.push({
            sender: '시스템',
            text: data.message || JSON.stringify(data)
          })
      }
      scrollToBottom()
    } catch (error) {
      console.error('메시지 파싱 실패:', error)
    }
  }

  socket.value.onclose = () => console.log('WebSocket 연결 종료')
  socket.value.onerror = (error) => console.error('WebSocket 에러:', error)
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !socket.value || socket.value.readyState !== WebSocket.OPEN) return

  const msg = newMessage.value.trim()

  // 내가 보낸 메시지를 즉시 화면에 추가
  messages.value.push({
    sender: guestUsername,
    text: msg
  })

  // Send message in the format expected by ChatService
  const aiRequest = {
    type: 'CHAT',
    message: msg,
    roomId: props.roomId,
    sender: guestUsername,
    isAiResponse: false,
    messageType: 'CHAT',
    userId: null,  // 비회원이므로 userId는 null
    chatRoomId: props.roomId
  }
  socket.value.send(JSON.stringify(aiRequest))
  
  newMessage.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.querySelector('.chat-messages')
    if (container) container.scrollTop = container.scrollHeight
  }, 100)
}

watch(() => props.roomId, (newVal) => {
  if (newVal) connectWebSocket()
})

onMounted(() => {
  connectWebSocket()
})

onBeforeUnmount(() => {
  if (socket.value) socket.value.close()
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

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.membership-icon {
  width: 48px;
  height: 48px;
  cursor: help;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.membership-icon:hover {
  opacity: 1;
}

/* 툴팁 스타일 */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 12px;
  font-size: 36px;
  white-space: pre-line;
  z-index: 1000;
  min-width: 600px;
  text-align: left;
  line-height: 1.8;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
}

.membership-status {
  display: flex;
  align-items: center;
}

.membership-icon {
  width: 48px;
  height: 48px;
  cursor: help;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.membership-icon:hover {
  opacity: 1;
}
</style>
