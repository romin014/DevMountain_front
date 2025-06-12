<template>
  <div class="chatroom">
    <h2>채팅방</h2>
    <div class="chat-messages">
      <div v-for="(msg, index) in messages" :key="index" class="chat-message">
        <strong>{{ msg.sender }}:</strong> {{ msg.text }}
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

export default {
  name: "Chatroom",
  data() {
    return {
      client: null,
      messages: [
        { sender: "시스템", text: "채팅방에 입장했습니다." }
      ],
      newMessage: "",
      username: "사용자" // 이후 로그인 연동 시 동적으로 설정 가능
    };
  },
  methods: {
    connect() {
      this.client = new Client({
        brokerURL: 'ws://localhost:8080/ws', // Spring Boot WebSocket 엔드포인트
        reconnectDelay: 5000,
        onConnect: () => {
          this.client.subscribe('/topic/messages', (message) => {
            const parsed = JSON.parse(message.body)
            this.messages.push(parsed)
            this.scrollToBottom()
          })
        },
        onStompError: (frame) => {
          console.error('Broker reported error:', frame.headers['message'])
          console.error('Additional details:', frame.body)
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
          destination: '/chatroom',
          body: JSON.stringify(msg)
        })
      }

      this.messages.push(msg)
      this.newMessage = ''
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatMessages = this.$el.querySelector(".chat-messages")
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      })
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

<style scoped>
.chatroom {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.chat-messages {
  border: 1px solid #ccc;
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fafafa;
}

.chat-message {
  margin-bottom: 5px;
}

.chat-form {
  display: flex;
}

.chat-form input {
  flex: 1;
  padding: 5px;
}

.chat-form button {
  margin-left: 5px;
}
</style>
