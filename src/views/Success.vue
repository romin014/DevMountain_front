<template>
  <div class="success-container">
    <h1>결제 성공!</h1>
    <p>{{ message }}</p>
    <button @click="goHome">홈으로 돌아가기</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const message = ref('처리 중입니다...')

onMounted(async () => {
  const { paymentKey, orderId, amount } = route.query
  if (!paymentKey || !orderId || !amount) {
    message.value = '잘못된 접근입니다.'
    return
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_CONFIRM_PAYMENT}`, {
        paymentKey,
        orderId,
        amount: parseInt(amount)
    }, { withCredentials: true })

    message.value = '유료 구독이 정상 처리되었습니다 🎉'
  } catch (err) {
    console.error(err)
    message.value = '결제 확인 중 오류가 발생했습니다.'
  }
})

const goHome = () => router.push('/home')
</script>

<style scoped>
.success-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #121212;
  color: #fff;
  text-align: center;
}
button {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #00bcd4;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: #000;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background-color: #00acc1;
}
</style>