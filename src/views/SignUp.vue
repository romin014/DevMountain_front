import axios from 'axios'

<template>
  <div>
    <h2>회원가입</h2>
    <form @submit.prevent="signup">
      <div>
        <label for="signup-email">이메일:</label>
        <input id="signup-email" v-model="email" placeholder="이메일" required/>
      </div>
      <div>
        <label for="signup-password">비밀번호:</label>
        <input id="signup-password" v-model="password" type="password" placeholder="비밀번호" required/>
      </div>
      <div>
        <label for="signup-name">이름:</label>
        <input id="signup-name" v-model="name" placeholder="이름" required/>
      </div>
      <div>
        <label for="signup-phone">전화번호:</label>
        <input id="signup-phone" v-model="phoneNumber" placeholder="전화번호" required/>
      </div>
      <div>
        <label for="signup-categories">카테고리:</label>
        <input id="signup-categories" v-model="categories" placeholder="카테고리 (,로 구분)"/>
        <!-- 참고: 실제 서비스에서는 미리 정의된 카테고리 목록에서 선택하는 UI가 더 좋습니다. -->
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '가입 중...' : '회원가입' }}
      </button>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
      <div style="margin-top: 20px;">
        <p>또는 소셜 계정으로 가입:</p>
        <button type="button" @click="socialLogin('google')">구글 로그인</button>
        <button type="button" @click="socialLogin('naver')">네이버 로그인</button>
      </div>

    </form>
  </div>
</template>
<script>
export default {
  data: () => ({
    email: "",
    emailRules: [
      v => !!v || '이메일을 작성해주세요',
      v => /.+@.+\..+/.test(v) || '이메일 형식으로 작성해주세요',
    ],
    password: "",
    passwordRules: [
      v => !!v || '비밀번호을 작성해주세요',
      v => (v && v.length >= 5) || '비밀번호는 5글자 이상 작성해주세요',
      v => /(?=.*\d)/.test(v) || '숫자를 포함해야합니다',
      v => /([!@$%])/.test(v) || '특수문자를 포함해야합니다 [!@#$%]'
    ],
    name: "",
    nameRules: [
      v => !!v || '닉네임을 작성해주세요',
      v => (v && v.length <= 10) || '닉네임을 10글자를 넘을 수 없습니다.',
    ],
    phoneNumber: "",
    phoneNumberRules: [
      v => !!v || '전화번호를 작성해주세요'
    ],
    categories: "",
    categoriesRules: [
      v => !!v || '카테고리를 작성해주세요',
      v => !!v || 'FRONTEND, BACKEND, MOBILE, AI, ETC 중에서 선택해주세요.'
    ],
    isLoading: false,
    errorMessage: "",
    successMessage: "",
  }),
  methods: {
    signUp() {
      // 간단한 수동 검증 예시
      if (!this.email || !this.password || !this.name || !this.phoneNumber) {
        alert("모든 필드를 작성해주세요.");
        return;
      }
      if (this.password !== this.confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      const saveData = {
        email: this.email,
        password: this.password,
        name: this.name,
        phoneNumber: this.phoneNumber,
        categories: this.categories.split(',').map(c => c.trim()),
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
          this.$router.push({path: './login'});
        }
      }).catch(error => {
        console.error("회원가입 실패:", error.response || error.message);
        alert("서버 오류가 발생했습니다.");
      });
    },
    linkToLogin() {
      this.$router.push({path: '/login'});
    },
    socialLogin(provider) {
      const baseUrl = "http://localhost:8080/oauth2/authorization";
      const url = `${baseUrl}/${provider}`;
      window.location.href = url;  // OAuth2 로그인 페이지로 이동
    }
  }
}
</script>

<style scoped>
div {
  margin-bottom: 10px;
}

label {
  display: inline-block;
  width: 80px;
}

input {
  margin-bottom: 5px;
}
</style>
