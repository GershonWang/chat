<template>
  <div class="common-layout">
    <el-container>
      <el-header class="title">
        <h1>欢迎使用</h1>
      </el-header>
      <el-main>
        <el-button type="success"><a @click="toGPT('/chat')">使用GPT问答</a></el-button>
        <el-button type="success"><router-link to="/demo">测试跳转</router-link></el-button>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter();

// 获取随机数
function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; 
  // s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); 
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}

// 跳转到聊天界面
function toGPT(path: string) {
  // 每次跳转到聊天界面，重新刷新一次uuid
  window.localStorage.setItem('uid', uuid());
  console.log(window.localStorage.getItem('uid'));
  // 跳转聊天界面
  router.push(path);
}

</script>

<style scoped>
.title {
  margin-bottom: 50px;
}
</style>