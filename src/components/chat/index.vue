<template>
    <el-button class="reback" @click="reback()">返回首页</el-button>
    <div>
        <h1>这是聊天界面</h1>
    </div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'

const router = useRouter();

function reback(){
    router.back();
}
</script>

<style scoped>
.reback {
    border-radius: 50px;
    background-color: darkgray;
    font-size: 12px;
    color: #333;
    font-weight: bold;
}
</style>