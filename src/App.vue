<script setup>
import TheWelcome from './components/TheWelcome.vue'
import {ref, onMounted} from 'vue'
import axios from 'axios'

const message = ref('로딩 중...')

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080', {withCredentials: true})
    message.value = res.data
  } catch (e) {
    message.value = '백엔드 연결 실패'
  }
})
</script>

<template>
  <div>
    <h1>Hello</h1>
    <nav>-->
      <RouterLink to="/">홈</RouterLink>
      |
      <RouterLink to="/users/login">로그인</RouterLink>
      |
      <RouterLink to="/users/signup">회원가입</RouterLink>
      |
      <RouterLink to="/users/me">내 정보</RouterLink>
    </nav>
    <router-view/>
  </div>
</template>

<!--<template>-->
<!--  <header>-->
<!--    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />-->

<!--    <div class="wrapper">-->
<!--      <nav>-->
<!--        <RouterLink to="/">홈</RouterLink> |-->
<!--        <RouterLink to="/users/login">로그인</RouterLink> |-->
<!--        <RouterLink to="/users/signup">회원가입</RouterLink> |-->
<!--        <RouterLink to="/users/me">내 정보</RouterLink>-->
<!--      </nav>-->
<!--    </div>-->
<!--  </header>-->

<!--  <main>-->
<!--    <TheWelcome />-->
<!--  </main>-->
<!--</template>-->

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
