<template>
  <div class="common-layout">
    <el-container>
      <el-header class="title">
        <h1>欢迎使用</h1>
      </el-header>
      <el-main>
        <el-button type="success" round><a @click="toGPT('/chat')">GPT问答</a></el-button>
        <el-button type="success" round><router-link to="/demo">测试跳转</router-link></el-button>
        <el-button type="danger" round><a @click="closeApp">关闭程序</a></el-button>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const { ipcRenderer } = require('electron');
const router = useRouter();


// 跳转到聊天界面
function toGPT(path: string) {
  // 跳转聊天界面
  router.push(path);
}

// 关闭程序
const closeApp = () => {
  ipcRenderer.send('close-app');
}
</script>

<style scoped>
.title {
  margin-bottom: 50px;
}
</style>