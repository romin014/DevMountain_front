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
      <p v-if="errorMessage" class="error-message" :class="{ 'social-login-guide': errorMessage.includes('소셜 로그인으로 가입되었습니다') }">{{ errorMessage }}</p>

      <div class="social-section">
        <p>또는 소셜 계정으로 로그인:</p>
        <div class="social-buttons">
          <button type="button" class="social-button google" @click="socialLogin('google')">구글 로그인</button>
          <button type="button" class="social-button naver" @click="socialLogin('naver')">네이버 로그인</button>
        </div>
      </div>
      
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
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_LOGIN}`,
        {
          email: email.value,
          password: password.value
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
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
      const errorMsg = err.response.data.message;
      
      // 소셜 로그인 안내 메시지인 경우 특별 처리
      if (errorMsg.includes('소셜로그인을 이용해주세요')) {
        errorMessage.value = '이 계정은 소셜 로그인으로 가입되었습니다. 아래 소셜 로그인 버튼을 이용해주세요.';
      } else {
        errorMessage.value = '로그인 실패: ' + errorMsg;
      }
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

// 소셜 로그인 함수 추가
const socialLogin = (provider) => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_OAUTH2_AUTHORIZATION}/${provider}`;
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

.social-login-guide {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 152, 0, 0.3);
  margin-bottom: 16px;
}

.social-section {
  margin-top: 30px;
  text-align: center;
  color: #bbb;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.social-button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.google {
  background-color: #ffffff;
  color: #000;
}

.google:hover {
  background-color: #e0e0e0;
}

.naver {
  background-color: #03c75a;
  color: white;
}

.naver:hover {
  background-color: #02b14a;
}
</style>
