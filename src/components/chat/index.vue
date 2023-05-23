<template>
    <el-button class="reback" @click="reback()">返回首页</el-button>
    <div class="common-layout">
        <el-container class="container">
            <el-header class="container-title">聊天界面</el-header>
            <el-container>
                <el-aside class="container-menu">菜单栏</el-aside>
                <el-container>
                    <el-main class="container-main" >结果输出界面</el-main>
                    <el-footer class="comtainer-footer" >
                        <el-input
                            v-model="textarea"
                            :rows="2"
                            type="textarea"
                            placeholder="请输入您要咨询的问题..."
                        />
                        <el-button type="success" plain round>发送</el-button>
                    </el-footer>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import { ref } from 'vue'

const textarea = ref('')
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
    margin-bottom: 20px;
}
.common-layout{
    width: 700px;
    height: 470px;
}
.container{
    width: 100%;
    height: 100%;
}
.container-title{
    background-color: cornflowerblue;
    font-size: 32px;
    font-weight: bold;
}
.container-menu{
    width: 120px;
    background-color: cadetblue;
}
.container-main{
    background-color: beige;
}
.comtainer-footer{
    text-align: center;
    background-color: blue;
}
</style>