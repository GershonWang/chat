<template>
    <div>
        <h1>Welcome</h1>
        <h1>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h1>
        <ul>
            <li><router-link to="/helloWorld">router-link 跳转 hello页面</router-link></li>
            <li><a @click="goTo('/helloWorld')">点击事件 跳转 hello页面</a></li>
            <li><a @click="$router.back()">跳回首页</a></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useCounterStore} from '../../store/counterStore'

const router = useRouter();
const counterStore = useCounterStore();

function goTo(path: string){
    router.push(path)
}
</script>

<style scoped>
ul{
    list-style: none;
}
</style>