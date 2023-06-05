<template>
    <div ref="container">
        <div v-for="item in state.items" :key="item.id">
            <div>
                {{ item.text }}
            </div>
            <div ref="child" v-if="item.showChild">
                <MarkdownRenderer :markdown="item.childText"></MarkdownRenderer>
            </div>
        </div>
    </div>
    <el-input v-model="message" style="width: 250px;"></el-input>
    <button @click="addItem">发送消息</button>
    <button @click="updateChildText()">修改第二层DOM元素</button>

    <div class="box">
        <div class="backdrop">毛玻璃</div>
    <div class="compare">对比</div>
    </div>
</template>

<script setup lang="ts">
import MarkdownRenderer from '../../renderer/MarkdownRenderer.vue';
import { Ref, reactive, ref } from 'vue';

interface Item {
    id: number;
    text: string;
    showChild: boolean;
    childText: string;
}

interface State {
    items: Item[];
}

const child: Ref<HTMLElement | null> = ref(null);
const message = ref('')

const state: State = reactive<State>({
    items: []
});

let itemId = 1;

const addItem = (): void => {
    const newItem: Item = {
        id: itemId,
        text: message.value,
        showChild: true,
        childText: ''
    };
    state.items.push(newItem);
    itemId++;
};

const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const updateChildText = async () => {
    const msg = '# 修改后的第二层DOM元素';
    for(let i=0;i < msg.length;i++){
        const item = state.items.at(state.items.length-1);
        (item as Item).childText += msg[i];
        await sleep(1000);
    }
    console.log('state.items',state.items);
    console.log('state.items.length',state.items.length);
    console.log('lastItem',state.items.at(state.items.length-1));
};
</script>

<style scoped>
.box {
        width: 700px;
        height: 700px;
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
    .compare{
        width: 80%;
        height: 40%;
        border-radius: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 60px;
        letter-spacing: 0.5em;
        background-color:rgba(255, 255, 255, 0.7);
    }

</style>