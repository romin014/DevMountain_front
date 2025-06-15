<!-- src/views/Fail.vue -->
<template>
  <div class="fail-container">
    <h1>결제 실패</h1>
    <p>결제 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
    <button @click="goHome">홈으로 돌아가기</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.fail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  color: #fff;
  background-color: #121212;
}

button {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #00bcd4;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: black;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background-color: #00acc1;
}
</style>