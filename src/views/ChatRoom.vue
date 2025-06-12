<template>
  <button class="home-box" @click="goHome">Home</button>
  <div class="chatroom">
    <h2>💬 채팅방</h2>

    <div class="chat-messages">
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

<script>
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

export default {
  name: 'Chatroom',
  data() {
    return {
      client: null,
      messages: [{ sender: '시스템', text: '채팅방에 입장했습니다.' }],
      newMessage: '',
      username: '사용자' // 필요 시 로그인된 유저 정보로 대체 가능
    }
  },
  methods: {
    connect() {
      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('WebSocket 연결됨')
          this.client.subscribe('/topic/messages', (message) => {
            const parsed = JSON.parse(message.body)
            this.messages.push(parsed)
            this.scrollToBottom()
          })
        },
        onStompError: (frame) => {
          console.error('STOMP 오류:', frame.headers['message'])
          console.error('상세:', frame.body)
        }
      })

      this.client.activate()
    },
    sendMessage() {
      if (!this.newMessage.trim()) return

      const msg = {
        sender: this.username,
        text: this.newMessage
      }

      if (this.client && this.client.connected) {
        this.client.publish({
          destination: '/chatrooms',
          body: JSON.stringify(msg)
        })
      }

      this.newMessage = ''
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatMessages = this.$el.querySelector('.chat-messages')
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      })
    },
    goHome() {
      this.$router.push('/')
    }
  },
  mounted() {
    this.connect()
  },
  beforeUnmount() {
    if (this.client) {
      this.client.deactivate()
    }
  }
}
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

.from-user .message-bubble {
  background-color: #0a84ff;
  color: #fff;
  border-top-right-radius: 0;
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
