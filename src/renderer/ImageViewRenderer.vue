<template>
    <!-- 过渡动画 -->
    <transition name="fade">
        <div class="img-view"><!-- 遮罩层 -->
            <div class="img-layer"></div>
            <div class="img"><img :src="imgSrc"></div>
        </div>
    </transition>
</template>
<script lang="ts">
export default {
    props: ['imgSrc']
}
</script>
<style scoped>
/*动画*/
.fade-enter-active,
.fade-leave-active {
    transition: all .2s linear;
    transform: translate3D(0, 0, 0);
}

.fade-enter,
.fade-leave-active {
    transform: translate3D(100%, 0, 0);
}

/* bigimg */
.img-view {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
}

/*遮罩层样式*/
.img-view .img-layer {
    position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/*不限制图片大小，实现居中*/
.img-view .img img {
    max-width: 100%;
    display: block;
    position: fixed;
    width: 60%;
    height: 80%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: auto;
    z-index: 1000;
}
</style>