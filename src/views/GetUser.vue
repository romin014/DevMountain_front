<template>
  <div>
    <h2>내 정보</h2>
    <div v-if="isLoading">로딩 중...</div>
    <div v-else-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
    <div v-else-if="user">
      <p>이메일: {{ user.email }}</p>
      <p>이름: {{ user.name }}</p>
      <p>전화번호: {{ user.phoneNumber }}</p>
      <p>카테고리: {{ user.categories.map(c => c.name).join(', ') }}</p>
    </div>
    <div v-else>유저 정보를 불러올 수 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref(null);
const isLoading = ref(true); // 로딩 상태 추가 (초기 로딩)
const errorMessage = ref('');

onMounted(async () => {
  try {
    const res = await axios.get('/users/me', { withCredentials: true });
    user.value = res.data;
  } catch (err) {
    console.error('유저 정보 로딩 실패', err);
    // 에러 메시지 표시
    errorMessage.value = '유저 정보를 불러오는 데 실패했습니다.';
    // alert('유저 정보를 불러오는 데 실패했습니다');
  } finally {
    isLoading.value = false; // 로딩 종료
  }
});
</script>

<style scoped>
</style>
