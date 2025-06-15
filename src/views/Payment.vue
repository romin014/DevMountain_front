<template>
  <div class="payment-wrapper">
    <button class="home-button" @click="goHome">홈으로</button>

    <div class="payment-box">
      <h2 class="title"> Devmountain PRO 구독</h2>
      <p class="desc">PRO 구독으로 더 많은 추천, 채팅 제한 해제, 개인화 기능을 이용해 보세요!</p>
      <button class="pay-button" @click="onClick">토스페이로 결제하기</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://js.tosspayments.com/v1/payment'
  script.async = true
  document.body.appendChild(script)
})

const onClick = async () => {
  const clientKey = 'test_ck_ORzdMaqN3wa2GKjxdyabr5AkYXQG'

  if (!window.TossPayments || typeof window.TossPayments !== 'function') {
    alert("TossPayments SDK가 아직 로딩되지 않았습니다.")
    return
  }

  try {
    const res = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // 꼭 있어야 쿠키/세션 포함됨
    });
    const data = await res.json()
    const orderId = data.result.orderId

    const tossPayments = window.TossPayments(clientKey)

    tossPayments.requestPayment('카드', {
      amount: 10000,
      orderId,
      orderName: 'DevMountain 유료 구독',
      customerName: '테스터',
      successUrl: `${window.location.origin}/success`,
      failUrl: `${window.location.origin}/fail`,
    })
  } catch (err) {
    console.error('주문 생성 실패', err)
    alert('주문 생성에 실패했습니다.')
  }
}

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.payment-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  background: #0e0e0e;
  color: white;
  min-height: 100vh;
  position: relative;
}

.home-button {
  position: absolute;
  top: 30px;
  left: 30px;
  background: #1e1e1e;
  color: #00ffff;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #00ffff;
  cursor: pointer;
  transition: background 0.3s;
}

.home-button:hover {
  background-color: #00ffff;
  color: #000;
}

.payment-box {
  background: #1e1e1e;
  padding: 40px;
  border-radius: 16px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2);
}

.title {
  font-size: 28px;
  margin-bottom: 16px;
}

.desc {
  font-size: 16px;
  margin-bottom: 30px;
  color: #bbb;
}

.pay-button {
  background: #00ffff;
  border: none;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  padding: 14px 28px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.pay-button:hover {
  background: #00e6e6;
}
</style>