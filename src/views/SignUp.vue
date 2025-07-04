<template>
  <div class="signup-container">
    <h2 class="signup-title">회원가입</h2>
    <form @submit.prevent="signUp" class="signup-form">
      <div class="form-group">
        <label for="signup-email">이메일:</label>
        <input id="signup-email" v-model="email" placeholder="이메일" required/>
      </div>

      <div class="form-group">
        <label for="signup-password">비밀번호:</label>
        <input id="signup-password" v-model="password" type="password" placeholder="비밀번호" required/>
      </div>

      <div class="form-group">
        <label for="signup-name">이름:</label>
        <input id="signup-name" v-model="name" placeholder="이름" required/>
      </div>

      <div class="form-group">
        <label for="signup-phone">전화번호:</label>
        <input id="signup-phone" v-model="phoneNumber" placeholder="전화번호" required/>
      </div>

      <div class="form-group">
        <label for="signup-categories">카테고리:</label>
        <input id="signup-categories" v-model="categories" placeholder="카테고리 (,로 구분)"/>
      </div>

      <button type="submit" :disabled="isLoading" class="signup-button">
        {{ isLoading ? '가입 중...' : '회원가입' }}
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <div class="social-section">
        <p>또는 소셜 계정으로 가입:</p>
        <div class="social-buttons">
          <button type="button" class="social-button google" @click="socialLogin('google')">구글 회원가입</button>
          <button type="button" class="social-button naver" @click="socialLogin('naver')">네이버 회원가입</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const email = ref("")
    const password = ref("")
    const name = ref("")
    const phoneNumber = ref("")
    const categories = ref("")
    const isLoading = ref(false)
    const errorMessage = ref("")
    const successMessage = ref("")

    const signUp = async () => {
      if (!email.value || !password.value || !name.value || !phoneNumber.value) {
        alert("모든 필드를 작성해주세요.")
        return
      }

      const saveData = {
        email: email.value,
        password: password.value,
        name: name.value,
        phoneNumber: phoneNumber.value,
        categories: categories.value.split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0)
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_SIGNUP}`, saveData, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })

        // 성공 응답이면 무조건 성공 처리
        alert('회원가입이 완료되었습니다!')
        router.push('/login')
      } catch (error) {
        if (error.response && error.response.data) {
          alert(error.response.data.message || '회원가입에 실패했습니다.')
        } else {
          alert('회원가입에 실패했습니다.')
        }
      }
    }

    const socialLogin = (provider) => {
      const baseUrl = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_OAUTH2_AUTHORIZATION}`
      window.location.href = `${baseUrl}/${provider}`
    }

    return {
      email,
      password,
      name,
      phoneNumber,
      categories,
      isLoading,
      errorMessage,
      successMessage,
      signUp,
      socialLogin
    }
  }
}
</script>

<style scoped>
.signup-container {
  max-width: 480px;
  margin: 80px auto;
  padding: 30px;
  background-color: #1e1e1e;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #f1f1f1;
}

.signup-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}

.signup-form {
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
}

input:focus {
  border-color: #00bcd4;
  outline: none;
}

.signup-button {
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

.signup-button:hover {
  background-color: #00acc1;
}

.signup-button:disabled {
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

.success-message {
  margin-top: 16px;
  color: #4caf50;
  font-weight: bold;
  text-align: center;
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
