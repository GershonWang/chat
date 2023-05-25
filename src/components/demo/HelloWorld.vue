<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useCounterStore } from '../../store/counterStore'
import { loginApi } from '../../api/auth'
import { ElMessage } from 'element-plus'

import { ref } from 'vue';
import MarkdownRenderer from '../../renderer/MarkdownRenderer.vue';

const myMarkdown = ref('# Hello, Markdown!');
const textarea = ref('')
const router = useRouter()
const counterStore = useCounterStore()

function goBack() {
  router.back()
}

async function add100() {
  const result = await counterStore.add100()
  console.log(result)
}

function login() {
  loginApi({ username: 'xxx', password: 'xxxa' }).then(res => {
    console.log(res)
    ElMessage.success(res.data.accessToken)
  })
}

const send = () =>{
  myMarkdown.value = textarea.value
}

</script>

<template>
  <el-button type="success" @click="goBack">返回上一层</el-button>
  <h1>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h1>
  <el-button type="success" @click="counterStore.increment">通过increment方法自增</el-button>
  <el-button type="success" @click="counterStore.counter++">直接访问state</el-button>
  <el-button type="success" @click="add100()">异步加100</el-button>
  <el-icon size="50" color="red"><i-ep-edit /></el-icon>
  <el-icon size="50" color="red"><i-ep-chatDotRound /></el-icon>
  <el-button type="success" @click="login()">发送登陆请求</el-button>
  
  <el-input v-model="textarea" :rows="2" type="textarea"></el-input>
  <el-button type="success" @click="send()">查看markdown编译后样式</el-button>
  <MarkdownRenderer :markdown="myMarkdown" />
</template>

<style scoped>

</style>
