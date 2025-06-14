<template>
  <div class="login-container">
    <h2 class="login-title">로그인</h2>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="email">이메일:</label>
        <input
            id="email"
            v-model="email"
            placeholder="이메일"
            required
        />
      </div>
      <div class="form-group">
        <label for="password">비밀번호:</label>
        <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호"
            required
        />
      </div>
      <button type="submit" :disabled="isLoading" class="login-button">
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
    const res = await axios.post(
        'http://localhost:8080/users/login',
        {
          email: email.value,
          password: password.value
        },
        { withCredentials: true }
    );
    console.log('로그인 성공:', res.data);

    // 로그인 성공 시 사용자 이름을 localStorage에 저장
    // (백엔드 응답 구조에 따라 name 위치 조정 필요)
    localStorage.setItem('username', res.data.name || '익명');

    // 로그인 후 홈 페이지 이동
    router.push('/home');
  } catch (err) {
    console.error('로그인 실패', err);
    if (err.response?.data?.message) {
      errorMessage.value = '로그인 실패: ' + err.response.data.message;
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>

.login-container {
  max-width: 420px;
  margin: 80px auto;
  padding: 30px;
  background-color: #1e1e1e;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #f1f1f1;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: #ffffff;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 18px;
}

label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #cccccc;
}

input {
  width: 100%;
  padding: 12px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #f1f1f1;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

input:focus {
  border-color: #00bcd4;
  outline: none;
}

.login-button {
  margin-top: 10px;
  padding: 12px;
  background-color: #00bcd4;
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-button:hover {
  background-color: #00acc1;
}

.login-button:disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  color: #ff5252;
  font-weight: bold;
  text-align: center;
}
</style>
