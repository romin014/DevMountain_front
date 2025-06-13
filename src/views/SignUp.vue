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
          <button type="button" class="social-button google" @click="socialLogin('google')">구글 로그인</button>
          <button type="button" class="social-button naver" @click="socialLogin('naver')">네이버 로그인</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    categories: "",
    isLoading: false,
    errorMessage: "",
    successMessage: "",
  }),
  methods: {
    signUp() {
      if (!this.email || !this.password || !this.name || !this.phoneNumber) {
        alert("모든 필드를 작성해주세요.");
        return;
      }

      const saveData = {
        email: this.email,
        password: this.password,
        name: this.name,
        phoneNumber: this.phoneNumber,
        categories: this.categories.split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0)
      };

      axios.post("http://localhost:8080/users/signup", saveData, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then(response => {
        if (response.data.errorCode === 400) {
          alert(response.data.errorMessage);
        } else {
          alert("회원가입이 완료되었습니다. 로그인 화면으로 돌아갑니다");
          this.$router.push({path: '/users/login'});
        }
      }).catch(error => {
        console.error("회원가입 실패:", error.response || error.message);
        alert("서버 오류가 발생했습니다.");
      });
    },
    socialLogin(provider) {
      const baseUrl = "http://localhost:8080/oauth2/authorization";
      window.location.href = `${baseUrl}/${provider}`;
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
