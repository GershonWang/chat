<template>
    <div class="image-viewer">
    <img :src="imageUrl" @click="showModal = true">
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <img :src="imageUrl">
        <button @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const showModal = ref(false)
    const imageUrl = ref(props.url)

    return {
      showModal,
      imageUrl
    }
  }
}
</script>

<style scoped>
.image-viewer {
  position: relative;
  display: inline-block;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  background-color: white;
  padding: 20px;
  text-align: center;
}

.modal-content img {
  max-width: 100%;
  max-height: 100%;
}
</style>