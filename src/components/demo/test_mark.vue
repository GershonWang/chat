<template>
    <el-button type="success" @click="router.push('/')">返回</el-button><br>

    <div class="box">
        <div class="backdrop">毛玻璃</div>
        <div class="compare">对比</div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

</script>

<style scoped>
.box {
    width: 700px;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background: url('https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.nbflzd.com%2Fwp-content%2Fuploads%2F2018%2F03%2F569.jpg&refer=http%3A%2F%2Fwww.nbflzd.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660896442&t=186cd406d82bd815f0fa898f2ce94ce1')no-repeat top; */
    background-size: 100%;
    background-position: center;
}

.backdrop {
    width: 80%;
    height: 40%;
    border-radius: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 60px;
    letter-spacing: 0.5em;
    backdrop-filter: blur(20px);
    color: #fff;
    box-shadow: 0 0 30px 10px rgba(0, 0, 0, 0.3);
}

.compare {
    width: 80%;
    height: 40%;
    border-radius: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 60px;
    letter-spacing: 0.5em;
    background-color: rgba(255, 255, 255, 0.7);
}
</style>