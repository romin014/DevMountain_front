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

export default {
  name: "Chatroom",
  data() {
    return {
      client: null,
      messages: [
        { sender: "시스템", text: "채팅방에 입장했습니다." }
      ],
      newMessage: "",
      username: "사용자"
    };
  },
  methods: {
    connect() {
      this.client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
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
    },
    goHome() {
      this.$router.push('/') // ✅ Vue Options API에서는 이렇게 써야 함
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
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.home-box {
  margin-left: 500px;
  margin-top: 50px;
  margin-bottom: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background-color 0.2s ease;
}

.chatroom h2 {
  text-align: center;
  margin-bottom: 16px;
  color: #333;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
}

.from-user {
  justify-content: flex-end;
}

.from-other {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px;
  border-radius: 12px;
  background-color: #e0e0e0;
  position: relative;
  color: #333;
}

.from-user .message-bubble {
  background-color: #daf1ff;
  color: #000;
  border-top-right-radius: 0;
}

.from-other .message-bubble {
  background-color: #f0f0f0;
  color: #333;
  border-top-left-radius: 0;
}

.sender {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
  display: block;
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
  border: 1px solid #ccc;
}

.chat-form button {
  padding: 10px 16px;
  background-color: #3498db;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-form button:hover {
  background-color: #2980b9;
}
</style>