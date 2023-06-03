<template>
  <div>
    <a @click="$router.back()">跳回首页</a>
    <h3>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h3>
    <ul>
      <li><router-link to="/helloWorld" style="color: white;margin-bottom: 5px">跳转到hello页面</router-link></li>
    </ul>
    <el-input v-model="numberA" style="width: 300px;"></el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {useCounterStore} from '../../store/counterStore'

const counterStore = useCounterStore();

const numberA = ref('');

let code = 1;

watch(numberA,()=>{
  console.log('点击次数：',code);
  code ++;
})

</script>

<style scoped>
ul {
  list-style: none;
}
</style>