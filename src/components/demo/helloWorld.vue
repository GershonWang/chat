<template>
  <h1>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h1>
  <el-button type="success" @click="counterStore.increment">通过increment方法自增</el-button>
  <el-button type="success" @click="counterStore.counter++">直接访问state</el-button>
  <el-button type="success" @click="add100()">异步加100</el-button>
  <el-icon size="50" color="red"><i-ep-edit /></el-icon>
  <el-icon size="50" color="red"><i-ep-chatDotRound /></el-icon>
  <el-button type="success" @click="goBack">返回上一层</el-button>
  <el-input v-model="myMarkdown" :rows="2" type="textarea" style="width: 450px;margin-top: 30px;"></el-input>
  <MarkdownRenderer :markdown="myMarkdown" :num="1"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/store/counterStore'
import MarkdownRenderer from '../../renderer/MarkdownRenderer.vue';

const myMarkdown = ref('# Hello, Markdown!');
const router = useRouter()
const counterStore = useCounterStore()

const goBack = () => {
  router.back();
}

const add100 = async () => {
  const result = await counterStore.add100()
  console.log(result)
}
</script>
<style scoped>

</style>
