<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import {useCounterStore} from '../store/counterStore'
import {loginApi} from '../api/auth'
import {ElMessage} from 'element-plus'

const router = useRouter()
const counterStore = useCounterStore()

defineProps<{ msg: string }>()

function goBack(){
  router.back()
}

async function add100(){
  const result = await counterStore.add100()
  console.log(result)
}

function login(){
  loginApi({username:'xxx',password:'xxxa'}).then(res =>{
    console.log(res)
    ElMessage.success(res.data.accessToken)
  })
}

</script>

<template>
  <el-button type="success" @click="goBack">测试</el-button>
  <h1>{{ msg }}</h1>
  <h1>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h1>
  <el-button type="success" @click="counterStore.increment">通过increment方法自增</el-button>
  <el-button type="success" @click="counterStore.counter++">直接访问state</el-button>
  <el-button type="success" @click="add100()">异步加100</el-button>
  <el-icon size="50" color="red"><i-ep-edit /></el-icon>
  <el-icon size="50" color="red"><i-ep-chatDotRound /></el-icon>
  <el-button type="success" @click="login()">发送登陆请求</el-button>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
