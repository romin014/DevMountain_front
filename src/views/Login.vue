<template>
  <div>
    <h2>로그인</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">이메일:</label>
        <input id="email" v-model="email" placeholder="이메일" required />
      </div>
      <div>
        <label for="password">비밀번호:</label>
        <input id="password" v-model="password" type="password" placeholder="비밀번호" required />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const login = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 모두 입력해주세요.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await axios.post('/users/login', {
      email: email.value,
      password: password.value
    }, { withCredentials: true });
    console.log('로그인 성공:', res.data);
    router.push('/home'); // 로그인 성공 후 홈으로 이동
  } catch (err) {
    console.error('로그인 실패', err);
    // 에러 메시지 표시
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = '로그인 실패: ' + err.response.data.message;
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false; // 로딩 종료
  }
};
</script>

<style scoped>
div { margin-bottom: 10px; }
label { display: inline-block; width: 80px; }
input { margin-bottom: 5px; }
</style>
