<template>
  <div>
    <a @click="$router.back()">返回上一页</a>
    <h3>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h3>
    <el-input v-model="numberA" style="width: 300px;"></el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {useCounterStore} from '@/store/counterStore'

const counterStore = useCounterStore();
const numberA = ref('');

watch(numberA,()=>{
  console.log('监控内容：',numberA);
})
</script>

<style scoped>
ul {
  list-style: none;
}
</style>