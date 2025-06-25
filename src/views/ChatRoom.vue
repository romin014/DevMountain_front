<template>
  <div class="chat-room">
    <div class="chat-header">
      <h2>회원 채팅방</h2>
      <div class="membership-status">
        <img
            :src="freeMembershipIcon"
            alt="Free 멤버십"
            class="membership-icon"
            title="Free 멤버십 혜택:
• 무제한 채팅 이용
• AI 강의 추천
• 기본 학습 경로 제공
• 시간당 10개 채팅 가능

Pro 멤버십 업그레이드 시:
• AI 강의 추천
• 기본 학습 경로 제공
• 시간당 20개 채팅 가능"
        />
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index"
           class="message"
           :class="{
             'ai-message': message.messageType === 'CHAT' || isChatLikeRecommendation(message),
             'user-message': !message.messageType,
             'recommendation-message': message.messageType === 'RECOMMENDATION' && !isChatLikeRecommendation(message)
           }">
        <div class="message-content">
          <div class="message-header">
            <div class="message-sender">{{ getMessageSender(message) }}</div>
          </div>
          <div v-if="message.messageType === 'RECOMMENDATION' && !isChatLikeRecommendation(message) && hasRecommendations(message)" class="recommendation-cards">
            <div v-for="(course, idx) in parseRecommendation(message)" :key="idx" class="course-card">
              <div class="course-thumbnail">
                <img :src="course.thumbnailUrl" :alt="course.title" class="thumbnail-image" />
              </div>
              <div class="course-info">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ course.description }}</p>
                <div class="course-meta">
                  <span class="instructor">👨‍🏫 {{ course.instructor }}</span>
                  <span class="level">📚 {{ course.level }}</span>
                </div>
                <a v-if="course.url" :href="course.url" target="_blank" class="course-link" @click="console.log('Link clicked:', course.url)">강의 보기 →</a>
                <div v-else class="course-no-link">링크 정보 없음</div>
              </div>
            </div>
          </div>
          <div v-else class="message-text">{{ formatMessage(message) }}</div>
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
// Vue의 반응형 변수, 라이프사이클 훅, axios 등 import
import { ref, watch, onUnmounted } from 'vue'
import axios from 'axios'
import freeMembershipIcon from '@/assets/free.png'

// 부모 컴포넌트로부터 roomId(채팅방), isGuest(비회원 여부) props로 전달받음
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

// 채팅 메시지 목록, 입력값, WebSocket, 연결상태, 스크롤 ref 선언
const messages = ref([]) // 채팅 메시지 배열
const newMessage = ref('') // 입력창 메시지
const ws = ref(null) // WebSocket 객체
const isConnected = ref(false) // WebSocket 연결 상태
const messagesContainer = ref(null) // 메시지 영역 DOM 참조
const streamingAiMessage = ref(null)

// 과거 메시지 불러오기(채팅방 진입/새로고침 시)
const fetchMessages = async () => {
  if (!props.roomId || props.isGuest) return // 방 ID 없거나 비회원이면 무시
  try {
    const response = await axios.get(
        `http://localhost:8080/chatrooms/${props.roomId}/messages`,
        { withCredentials: true }
    )

    if (response.data.success) {
      // AI_REQUEST 타입 메시지는 필터링, sender가 AI면 aiResponse 플래그 추가
      messages.value = response.data.result
          .filter(msg => {
            if (msg.userId && typeof msg.message === 'string') {
              try {
                const parsed = JSON.parse(msg.message)
                if (parsed && parsed.type === 'AI_REQUEST') {
                  return false
                }
              } catch (e) {
                // 평문은 그대로 표시
              }
            }
            return true
          })
          .map(msg => ({
            ...msg,
            aiResponse: msg.sender === 'AI'
          }))
      scrollToBottom()
    }
  } catch (error) {
    console.error('메시지 조회 실패:', error)
  }
}

// 메시지 포맷팅(추천 메시지/일반 메시지 구분)
const formatMessage = (message) => {
  // 추천 메시지(배열)일 경우 포맷
  if (message.messageType === 'RECOMMENDATION' && Array.isArray(message.recommendations)) {
    return message.recommendations.map((rec, idx) => `
[추천 강의 ${idx + 1}] ${rec.title}
${rec.description}
강사: ${rec.instructor}
난이도: ${rec.level}
썸네일: ${rec.thumbnailUrl}
    `).join('\n\n')
  }
  // AI_REQUEST JSON 메시지는 content만 추출
  if (message.userId && typeof message.message === 'string') {
    try {
      const parsed = JSON.parse(message.message)
      if (parsed && parsed.content) return parsed.content
    } catch (e) {
      return message.message
    }
  }
  // 기타 메시지(일반 텍스트)
  return message.message || message.text || message.content || ''
}

// 추천 강의가 있는지 확인(카드 UI 표시 조건)
const hasRecommendations = (message) => {
  if (message.messageType !== 'RECOMMENDATION') return false
  try {
    const recommendations = parseRecommendation(message)
    console.log('Has recommendations check:', recommendations)
    return recommendations && recommendations.length > 0 && recommendations[0].thumbnailUrl
  } catch (e) {
    console.error('Error in hasRecommendations:', e)
    return false
  }
}

// WebSocket 연결 및 메시지 수신 핸들러
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
    fetchMessages() // 연결되면 과거 메시지 불러오기
  }
  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // 1. 방 이름 업데이트 메시지 처리
      if (data.type === "ROOM_NAME_UPDATE") {
        console.log("room name update");
        window.dispatchEvent(new CustomEvent("roomNameUpdate", { detail: data }));
        return;
      }

      // 2. 추천 메시지 처리
      if (data.messageType === 'RECOMMENDATION') {
        messages.value.push(data);
        scrollToBottom();
        return;
      }

      // 3. AI 채팅 메시지 스트리밍 처리 (타이핑 효과 구현)
      // [수정] data.isAiResponse -> data.aiResponse 로 변경
      if (data.aiResponse && data.messageType === 'CHAT') {

        // data.first, data.last 는 이전 답변에서 수정한 그대로 유지합니다.
        if (data.first) {
          const newAiMessage = {
            ...data,
            message: data.message || '',
          };
          messages.value.push(newAiMessage);
          streamingAiMessage.value = newAiMessage;
        }
        else if (!data.last && streamingAiMessage.value) {
          streamingAiMessage.value.message += data.message || '';
        }
        else if (data.last) {
          streamingAiMessage.value = null;
        }

        scrollToBottom();
        return; // 스트리밍 메시지 처리가 끝나면 여기서 함수를 종료합니다.
      }

      // 4. 스트리밍이 아닌 다른 AI 응답이 있을 경우를 위한 폴백
      // (위의 if문에서 return 처리되므로, 스트리밍 메시지는 이 코드를 실행하지 않습니다)
      if (data.aiResponse) {
        messages.value.push(data);
        scrollToBottom();
      }

    } catch (error) {
      console.error('메시지 파싱 실패:', error);
    }
  }

  ws.value.onerror = () => isConnected.value = false
  ws.value.onclose = () => {
    isConnected.value = false
    streamingAiMessage.value = null;
  }
}

// 메시지 전송(입력값 서버로 POST, WebSocket으로 AI 요청 전송)
const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.roomId) return
  try {
    const response = await axios.post(
        `http://localhost:8080/chatrooms/${props.roomId}/messages`,
        { message: newMessage.value.trim() },
        { withCredentials: true }
    )
    if (response.data.success) {
      // 내 메시지 화면에 추가
      messages.value.push({
        ...response.data.result,
        aiResponse: false
      })
      newMessage.value = ''
      scrollToBottom()
      // AI에게 WebSocket으로 요청 전송
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
    if (error.response && error.response.status === 429) {
      // 서버에서 내려준 메시지 보여주기
      alert(error.response.data || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    } else {
      console.error('메시지 전송 실패:', error)
      alert('메시지 전송에 실패했습니다')
    }
  }
}

// 스크롤을 항상 맨 아래로 이동(새 메시지 도착 시)
const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}

// 추천 메시지 중 "아쉽지만..." 텍스트 포함 여부로 일반 채팅처럼 표시할지 판단
const isChatLikeRecommendation = (message) => {
  if (message.messageType !== 'RECOMMENDATION') return false;

  // content가 undefined/null이어도 항상 문자열로 변환
  const content = message && message.content != null
      ? (typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content))
      : '';
  return content.includes('아쉽지만, 현재 조건에 맞는 강의를 찾지 못했어요');
};

// 메시지 보낸이 표시(나/AI/AI추천)
const getMessageSender = (message) => {
  if (!message.messageType) return '나';
  if (message.messageType === 'CHAT' || isChatLikeRecommendation(message)) return 'AI';
  if (message.messageType === 'RECOMMENDATION') return 'AI 추천';
  return 'AI';
};

// 추천 메시지에서 강의 배열 추출(여러 포맷 대응)
const parseRecommendation = (message) => {
  try {
    console.log('Parsing recommendation message:', message)

    // message.content에서 recommendations 추출
    let content = message.content
    if (typeof content === 'string') {
      content = JSON.parse(content)
    }

    console.log('Parsed content:', content)

    // content가 직접 recommendations 배열인 경우
    if (Array.isArray(content)) {
      console.log('Content is array:', content)
      return content
    }

    // content.recommendations가 있는 경우
    if (content && content.recommendations && Array.isArray(content.recommendations)) {
      console.log('Found content.recommendations:', content.recommendations)
      return content.recommendations
    }

    // message.recommendations가 있는 경우 (기존 로직)
    if (message.recommendations && Array.isArray(message.recommendations)) {
      console.log('Found message.recommendations:', message.recommendations)
      return message.recommendations
    }

    console.log('No recommendations found, returning empty array')
    return []
  } catch (e) {
    console.error('Failed to parse recommendation:', e, 'Message:', message);
    return [];
  }
};

// roomId가 바뀌면 WebSocket 재연결 및 메시지 초기화
watch(() => props.roomId, (newRoomId, oldRoomId) => {
  if (newRoomId !== oldRoomId) {
    messages.value = []
    streamingAiMessage.value = null; // [추가] 방 변경 시 스트리밍 참조 초기화
    if (ws.value) ws.value.close()
    if (newRoomId) connectWebSocket()
  }
}, { immediate: true })

// 컴포넌트 언마운트 시 WebSocket 정리
onUnmounted(() => {
  if (ws.value) ws.value.close()
  streamingAiMessage.value = null; // [추가] 컴포넌트 파괴 시 스트리밍 참조 초기화
})
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 67vh;
  min-height: 500px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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
  max-width: 75%;
  margin: 4px 0;
  width: fit-content;
}

.ai-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
}

.recommendation-message {
  max-width: 90%;
  width: 90%;
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

.recommendation-message .message-content {
  background-color: transparent;
  padding: 0;
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

/* 추천 강의 카드 스타일 */
.recommendation-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.course-card {
  background: linear-gradient(135deg, #2a2a2a 0%, #333333 100%);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #404040;
  max-width: 100%;
  box-sizing: border-box;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.course-thumbnail {
  width: 100%;
  height: 180px;
  overflow: hidden;
  position: relative;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .thumbnail-image {
  transform: scale(1.05);
}

.course-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.course-title {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 1.2em;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-description {
  margin: 0 0 16px 0;
  color: #ccc;
  font-size: 0.95em;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.instructor, .level {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #bbb;
  font-size: 0.9em;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.course-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white !important;
  padding: 12px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  text-align: center;
  cursor: pointer;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  align-self: stretch;
}

.course-link:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.course-link:active {
  transform: translateY(0);
}

.course-no-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #666 0%, #555 100%);
  color: #ccc;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95em;
  text-align: center;
  box-sizing: border-box;
  align-self: stretch;
}

@media (max-width: 768px) {
  .chat-room {
    width: 95vw;
    max-width: none;
    margin: 0 2.5vw;
  }

  .message {
    max-width: 85%;
  }

  .recommendation-message {
    max-width: 95%;
    width: 95%;
  }

  .course-card {
    margin: 0;
  }

  .course-thumbnail {
    height: 160px;
  }

  .course-info {
    padding: 16px;
    box-sizing: border-box;
  }

  .course-title {
    font-size: 1.1em;
  }

  .course-meta {
    gap: 12px;
    margin-bottom: 16px;
  }

  .instructor, .level {
    font-size: 0.85em;
    padding: 4px 10px;
  }
}
</style>
