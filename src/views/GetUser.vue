<template>
  <div class="profile-container">
    <h2 class="profile-title">내 프로필</h2>

    <div v-if="isLoading" class="loading">로딩 중...</div>

    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-else-if="user" class="profile-card">
      <div class="avatar">
        <span>{{ user.name?.charAt(0) || "U" }}</span>
      </div>
      <div class="info">
        <p><strong>이메일:</strong> {{ user.email }}</p>
        <p><strong>이름:</strong> {{ user.name }}</p>
        <p><strong>전화번호:</strong> {{ user.phoneNumber }}</p>
        <p><strong>카테고리:</strong> {{ user.categories.map(c => c.name).join(', ') }}</p>
      </div>
    </div>

    <div v-else class="no-user">유저 정보를 불러올 수 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const res = await axios.get('/users/me', { withCredentials: true })
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
.profile-container {
  max-width: 600px;
  margin: 80px auto;
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