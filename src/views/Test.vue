<template>
  <div>
    <h2>서버 연결 테스트</h2>
    <button @click="testConnection">테스트 요청</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'

const message = ref('')

const testConnection = async () => {
  try {
    const res = await axios.get('/users/test', { withCredentials: true })
    message.value = res.data
  } catch (err) {
    message.value = '서버 연결 실패'
    console.error(err)
  }
}
</script>
