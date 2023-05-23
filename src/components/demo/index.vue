<template>
    <div>
        <h1>欢迎使用chatGPT(战损版)客户端</h1>
        <!-- <h1>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h1> -->
        <ul>
            <li><router-link to="/hello">router-link 跳转 hello页面</router-link></li>
            <li><a @click="goTo('/hello')">点击事件 跳转 hello页面</a></li>
            <li><router-link to="/chat">问答</router-link></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useCounterStore} from '../../store/counterStore'

const router = useRouter()
const counterStore = useCounterStore()

function goTo(path: string){
    router.push(path)
}
</script>

<style scoped>
    ul{
        list-style: none;
    }
</style>