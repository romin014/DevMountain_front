<template>
  <div class="chat-room">
    <div class="chat-header">
      <h2>회원 채팅방</h2>
      <!-- 멤버십 아이콘 -->
      <div class="membership-status">
        <img 
          :src="freeMembershipIcon" 
          alt="Free 멤버십" 
          class="membership-icon"
          title="Free 멤버십 혜택:
• 무제한 채팅 이용
• AI 강의 추천
• 기본 학습 경로 제공

Pro 멤버십 업그레이드 시:
• 추후 추가 예정"
        />
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index"
           class="message"
           :class="{ 'ai-message': message.aiResponse, 'user-message': !message.aiResponse }">
        <div class="message-content">
          <div class="message-header">
            <div class="message-sender">{{ message.aiResponse ? 'AI' : '나' }}</div>
          </div>
          <div class="message-text">{{ formatMessage(message) }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="메시지를 입력하세요..."
          :disabled="!isConnected"
      />
      <button @click="sendMessage" :disabled="!isConnected">전송</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import freeMembershipIcon from '@/assets/free.png'

const props = defineProps({
  roomId: {
    type: [String, null],
    required: false,
    default: null
  },
  isGuest: {
    type: Boolean,
    default: false
  }
})

const messages = ref([])
const newMessage = ref('')
const ws = ref(null)
const isConnected = ref(false)
const messagesContainer = ref(null)

const fetchMessages = async () => {
  if (!props.roomId || props.isGuest) return

  try {
    const response = await axios.get(
        `http://localhost:8080/chatrooms/${props.roomId}/messages`,
        { withCredentials: true }
    )

    if (response.data.success) {
      messages.value = response.data.result.map(msg => ({
        ...msg,
        aiResponse: msg.sender === 'AI'
      }))
      scrollToBottom()
    }
  } catch (error) {
    console.error('메시지 조회 실패:', error)
  }
}

const formatMessage = (message) => {
  if (message.messageType === 'RECOMMENDATION' && Array.isArray(message.recommendations)) {
    return message.recommendations.map((rec, idx) => `
[추천 강의 ${idx + 1}] ${rec.title}
${rec.description}
강사: ${rec.instructor}
난이도: ${rec.level}
썸네일: ${rec.thumbnailUrl}
    `).join('\n\n')
  }
  return message.message || message.text || message.content || ''
}

const connectWebSocket = () => {
  if (!props.roomId) {
    console.log('roomId가 없어 WebSocket 연결을 시도하지 않습니다')
    return
  }

  console.log('WebSocket 연결 시도:', props.roomId)
  const token = localStorage.getItem('token')
  const wsUrl = `ws://localhost:8080/ws/chat?roomId=${props.roomId}${token ? `&token=${token}` : ''}`

  ws.value = new WebSocket(wsUrl)

  ws.value.onopen = () => {
    console.log('WebSocket 연결 성공')
    isConnected.value = true
    fetchMessages()
  }

  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.aiResponse) {
        messages.value.push(data)
        scrollToBottom()
      }
    } catch (error) {
      console.error('메시지 파싱 실패:', error)
    }
  }

  ws.value.onerror = () => isConnected.value = false
  ws.value.onclose = () => isConnected.value = false
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.roomId) return

  try {
    const response = await axios.post(
        `http://localhost:8080/chatrooms/${props.roomId}/messages`,
        { message: newMessage.value.trim() },
        { withCredentials: true }
    )

    if (response.data.success) {
      messages.value.push({
        ...response.data.result,
        aiResponse: false
      })
      newMessage.value = ''
      scrollToBottom()

      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        const aiRequest = {
          type: 'AI_REQUEST',
          content: response.data.result.message,
          roomId: props.roomId
        }
        ws.value.send(JSON.stringify(aiRequest))
      }
    }
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    alert('메시지 전송에 실패했습니다')
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}

watch(() => props.roomId, (newRoomId, oldRoomId) => {
  if (newRoomId !== oldRoomId) {
    messages.value = []
    if (ws.value) ws.value.close()
    if (newRoomId) connectWebSocket()
  }
}, { immediate: true })

onUnmounted(() => {
  if (ws.value) ws.value.close()
})
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 67vh;
  min-height: 500px;
  background-color: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
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

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin: 4px 0;
}

.ai-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  color: #fff;
}

.ai-message .message-content {
  background-color: #2a2a2a;
  border-top-left-radius: 4px;
}

.user-message .message-content {
  background-color: #0a84ff;
  border-top-right-radius: 4px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 12px;
}

.ai-message .message-sender {
  color: #0a84ff;
}

.user-message .message-sender {
  color: #fff;
  text-align: right;
}

.message-text {
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 20px;
  background-color: #2a2a2a;
  border-top: 1px solid #333;
  flex-shrink: 0;
}

.chat-input input {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background-color: #1e1e1e;
  color: #fff;
  font-size: 14px;
}

.chat-input input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #0a84ff;
}

.chat-input button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background-color: #0a84ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-input button:hover {
  background-color: #0066cc;
}

.chat-input button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
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
</style>
