<template>
    <div class="common-layout">
      <el-container>
        <el-header class="title"><h1>欢迎使用</h1></el-header>
        <el-main>
            <el-button type="success"><router-link to="/chat">使用GPT问答</router-link></el-button>
            <el-button type="success"><router-link to="/demo">测试跳转</router-link></el-button>
        </el-main>
      </el-container>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
    .title{
        margin-bottom: 50px;
    }
</style>