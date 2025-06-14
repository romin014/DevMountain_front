<template>
  <div class="page-container">

    <button class="home-box" @click="goHome">Home</button>


    <div class="profile-container">
      <h2 class="profile-title">내 프로필</h2>

      <div v-if="isLoading" class="loading">로딩 중...</div>

      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else>
        <template v-if="user">
          <div class="profile-card">
            <div class="avatar">
              <span>{{ user.name?.charAt(0) || "U" }}</span>
            </div>
            <div class="info">
              <p><strong>이메일:</strong> {{ user.email }}</p>
              <p><strong>이름:</strong> {{ user.name }}</p>
              <p><strong>전화번호:</strong> {{ user.phoneNumber }}</p>
              <p><strong>카테고리:</strong> {{ (user.categories ?? []).map(c => c.name).join(', ') }}</p>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="no-user">유저 정보를 불러올 수 없습니다.</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const user = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

const goHome = () => {
  router.push('/home')
}

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/users/me', { withCredentials: true })
    console.log('백엔드 응답:', res.data)
    user.value = res.data
  } catch (err) {
    console.error('유저 정보 로딩 실패', err)
    errorMessage.value = '유저 정보를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.page-container {
  background-color: #ffffff;
  min-height: 100vh;
  padding: 40px;
  box-sizing: border-box;
  position: relative;
}


.home-box {
  margin-left: 400px;
  margin-bottom: 12px;
  background-color: #1e1e1e;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background-color 0.2s ease;
}

.home-box:hover {
  background-color: #5ca7cb;
}

.profile-container {
  margin: 40px auto 0 auto;
  max-width: 600px;
  padding: 30px;
  background-color: #1e1e1e;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  color: #f1f1f1;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #ffffff;
}

.loading,
.no-user {
  text-align: center;
  color: #999;
  font-size: 16px;
}

.error-message {
  text-align: center;
  color: #ff5252;
  font-weight: bold;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2a2a2a;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.05);
}

.avatar {
  width: 96px;
  height: 96px;
  background-color: #00bcd4;
  color: #000;
  border-radius: 50%;
  font-size: 36px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 188, 212, 0.3);
}

.info p {
  margin: 8px 0;
  font-size: 16px;
}

.info strong {
  color: #bbb;
}
</style>
