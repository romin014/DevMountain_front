<template>
  <div class="chatroom-list">
    <div class="list-header">
      <h2>채팅방 목록</h2>
      <button class="create-room-btn" @click="createRoom">
        새 채팅방 만들기
      </button>
    </div>

    <div class="room-list">
      <div v-for="room in chatRooms" :key="room.chatroomId"
           class="room-item"
           :class="{ active: selectedRoomId === room.chatroomId }"
           @click="selectRoom(room)">
        <div class="room-info">
          <h3>{{ room.chatroomName || '이름 없는 채팅방' }}</h3>
          <p class="room-meta">
            <span>생성일: {{ formatDate(room.createdAt) }}</span>
            <span>타입: {{ room.roomType }}</span>
          </p>
        </div>
        <button class="delete-btn" @click="confirmDelete(room)" title="채팅방 삭제">
          🗑️
        </button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>채팅방 삭제</h3>
        <p>정말로 이 채팅방을 삭제하시겠습니까?</p>
        <p class="room-to-delete">{{ roomToDelete?.chatroomName || '이름 없는 채팅방' }}</p>
        <div class="modal-buttons">
          <button @click="deleteRoom" class="delete-btn">삭제</button>
          <button @click="showDeleteModal = false" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import axios from 'axios'

const props = defineProps({
  onRoomSelect: {
    type: Function,
    required: true
  }
})

const chatRooms = ref([])
const selectedRoomId = ref(null)
const showDeleteModal = ref(false)
const roomToDelete = ref(null)

// 이벤트 콜백을 별도 함수로 분리
const handleRoomNameUpdate = () => {
  console.log('roomNameUpdate 이벤트 감지!')
  setTimeout(() => {
    fetchChatRooms()
  }, 1000)
}

const formatDate = (dateString) => {
  if (!dateString) return '날짜 없음'
  return new Date(dateString).toLocaleDateString()
}

const selectRoom = (room) => {
  selectedRoomId.value = room.chatroomId
  props.onRoomSelect(room.chatroomId)
}

const fetchChatRooms = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_CHATROOMS}`,
      { withCredentials: true }
    )
    if (response.data.success) {
      chatRooms.value = response.data.result
    }
  } catch (error) {
    console.error('채팅방 목록 조회 실패:', error)
  }
}

const createRoom = async () => {
  // 기본 채팅방 이름 사용
  const defaultRoomName = ''
  try {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_CHATROOMS}`,
        {
          chatroomName: defaultRoomName
        },
        { withCredentials: true }
    )

    console.log('채팅방 생성 응답:', response.data)

    if (response.data.success) {
      setTimeout(() => {
        fetchChatRooms()
      }, 1000)
      if (response.data.result && response.data.result.chatroomId) {
        selectRoom(response.data.result)
      }
      window.dispatchEvent(new CustomEvent('roomNameUpdate'))
    } else {
      alert('채팅방 생성에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'))
    }
  } catch (error) {
    console.error('채팅방 생성 실패:', error)
    alert('채팅방 생성에 실패했습니다: ' + (error.response?.data?.message || error.message))
  }
}

const confirmDelete = (room) => {
  roomToDelete.value = room
  showDeleteModal.value = true
}

const deleteRoom = async () => {
  if (!roomToDelete.value) return

  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ENDPOINT_CHATROOMS}/${roomToDelete.value.chatroomId}`,
      { withCredentials: true }
    )

    // 응답이 없거나, success가 true이거나, status가 204면 성공 처리
    if (
      !response.data ||
      response.data.success ||
      response.status === 204
    ) {
      setTimeout(() => {
        fetchChatRooms()
      }, 1000)
      showDeleteModal.value = false
      roomToDelete.value = null

      if (selectedRoomId.value === roomToDelete.value?.chatroomId) {
        selectedRoomId.value = null
        props.onRoomSelect(null)
      }
      window.dispatchEvent(new CustomEvent('roomNameUpdate'))
      return
    }

    // 실패 처리
    alert('채팅방 삭제에 실패했습니다: ' + (response.data?.message || '알 수 없는 오류'))
  } catch (error) {
    // 204 No Content도 catch로 빠질 수 있음
    if (error.response && error.response.status === 204) {
      // 성공 처리
      setTimeout(() => {
        fetchChatRooms()
      }, 1000)
      showDeleteModal.value = false
      roomToDelete.value = null
      if (selectedRoomId.value === roomToDelete.value?.chatroomId) {
        selectedRoomId.value = null
        props.onRoomSelect(null)
      }
      window.dispatchEvent(new CustomEvent('roomNameUpdate'))
      return
    }
    console.error('채팅방 삭제 실패:', error)
    alert('채팅방 삭제에 실패했습니다')
  }
}

onMounted(() => {
  fetchChatRooms()
  window.addEventListener('roomNameUpdate', handleRoomNameUpdate)
})
onUnmounted(() => {
  window.removeEventListener('roomNameUpdate', handleRoomNameUpdate)
})
</script>

<style scoped>
.chatroom-list {
  width: 300px;
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
  margin-right: 20px;
  position: relative;
  height: 63vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.create-room-btn {
  background-color: #0a84ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.create-room-btn:hover {
  background-color: #0066cc;
}

.room-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-item {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-item:hover {
  background-color: #333;
}

.room-item.active {
  background-color: #0a84ff;
}

.room-info {
  flex: 1;
  cursor: pointer;
}

.room-info h3 {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 16px;
}

.room-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
  margin: 0;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: rgba(255, 68, 68, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2a2a2a;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #fff;
}

.room-name-input {
  width: 100%;
  padding: 12px;
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  margin-bottom: 20px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.create-btn, .cancel-btn, .delete-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.create-btn {
  background-color: #0a84ff;
  color: white;
}

.cancel-btn {
  background-color: #444;
  color: #fff;
}

.delete-btn {
  background-color: #ff4444;
  color: white;
}

.create-btn:hover {
  background-color: #0066cc;
}

.cancel-btn:hover {
  background-color: #555;
}

.delete-btn:hover {
  background-color: #cc0000;
}

.room-to-delete {
  color: #ff4444;
  font-weight: bold;
  margin: 10px 0;
}
</style>
